import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { handleApiError, AuthenticationError, ValidationError, NotFoundError, DatabaseError, AuthorizationError } from '@/lib/backend/errors';
import { logger } from '@/lib/backend/logger';
import { rateLimit, getClientIP } from '@/lib/backend/security';
import { dbOperation, verifyTableStructure } from '@/lib/backend/database';
import { validateUUID } from '@/lib/backend/validation';
import { cache } from '@/lib/backend/cache';
import { performanceMonitor } from '@/lib/backend/performance';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    if (Date.now() > sessionData.expiresAt) {
      logger.warn('Admin session expired', { email: sessionData.email });
      return null;
    }
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', sessionData.email)
      .eq('role', 'admin')
      .single();
    
    if (error || !user) {
      logger.warn('Admin verification failed', { email: sessionData.email, error });
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('Error verifying admin', error);
    return null;
  }
}

// GET - List all orders
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting for admin endpoints
    if (!rateLimit(`admin:orders:${clientIP}`, 200, 60000)) {
      logger.warn('Admin rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const admin = await verifyAdmin(request);
    if (!admin) {
      throw new AuthenticationError('Admin authentication required');
    }

    logger.info('Admin fetching orders', { adminId: admin.id });

    // Verify table structure (cached)
    const tableExists = await cache.getOrSet(
      'table:orders:exists',
      async () => verifyTableStructure('orders', ['items', 'shipping_address']),
      5 * 60 * 1000
    );
    
    if (!tableExists) {
      throw new Error('Orders table structure issue');
    }

    // Check for cache-busting parameter
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.has('t'); // If timestamp parameter exists, force refresh
    
    // Use cached customized order IDs (refresh every 30 seconds, or immediately if force refresh)
    const customizedOrderIdSet = await cache.getOrSet(
      'customized_order_ids',
      async () => {
        const { data: customizedOrderIds, error: customError } = await supabaseAdmin
          .from('customized_orders')
          .select('order_id')
          .not('order_id', 'is', null);
        
        if (customError) {
          logger.warn('Error fetching customized order IDs', customError);
          return new Set<string>();
        }
        
        return new Set(
          (customizedOrderIds || [])
            .map((co: any) => co.order_id)
            .filter(Boolean)
        );
      },
      forceRefresh ? 0 : 30 * 1000 // 0 cache if force refresh, otherwise 30 seconds
    );

    // Fetch all orders with optimized query and performance monitoring
    const allOrders = await performanceMonitor.measure(
      'fetch_orders',
      async () => {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          logger.error('Error fetching orders', error);
          throw error;
        }
        
        return data || [];
      }
    );

    // Filter out orders that have customized items
    // Also filter out orders with failed payment status (unsuccessful payments)
    const data = allOrders.filter((order: any) => 
      !customizedOrderIdSet.has(order.id) && 
      order.payment_status !== 'failed'
    );

    logger.info('Orders fetched successfully', { 
      total: allOrders.length,
      filtered: data.length 
    });

    const response = NextResponse.json({ orders: data });
    
    // Add cache headers for admin endpoints (no cache to ensure fresh data)
    // If force refresh is requested, ensure no caching
    if (forceRefresh) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } else {
      response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
    }
    
    return response;
  } catch (error) {
    logger.error('Error in GET /api/admin/orders', error, { ip: clientIP });
    return handleApiError(error);
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw new AuthenticationError('Admin authentication required');
    }

    const body = await request.json();
    const { id, status, payment_status, tracking_number, notes } = body;

    if (!id || !validateUUID(id)) {
      throw new ValidationError('Valid order ID is required');
    }

    // Validate status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      throw new ValidationError(`Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    if (tracking_number !== undefined) {
      updates.tracking_number = typeof tracking_number === 'string' 
        ? tracking_number.trim().slice(0, 100) 
        : null;
    }
    if (notes !== undefined) {
      updates.notes = typeof notes === 'string' 
        ? notes.trim().slice(0, 1000) 
        : null;
    }

    logger.info('Admin updating order', { 
      adminId: admin.id, 
      orderId: id, 
      updates: Object.keys(updates) 
    });

    const order = await dbOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      'Failed to update order'
    );

    logger.info('Order updated successfully', { orderId: id });

    return NextResponse.json({ order });
  } catch (error) {
    logger.error('Error in PUT /api/admin/orders', error, { ip: clientIP });
    return handleApiError(error);
  }
}

// DELETE - Delete an order
export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw new AuthenticationError('Admin authentication required');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !validateUUID(id)) {
      throw new ValidationError('Valid order ID is required');
    }

    // Check if order exists before deleting
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      throw new NotFoundError('Order');
    }

    logger.warn('Admin deleting order', { 
      adminId: admin.id, 
      orderId: id,
      orderNumber: existingOrder.order_number 
    });

    // Check for related records that might prevent deletion
    // Note: order_items should cascade delete, but let's check for other references
    
    // Check and update customized orders
    try {
      const { data: customizedOrders, error: customError } = await supabaseAdmin
        .from('customized_orders')
        .select('id')
        .eq('order_id', id)
        .is('deleted_at', null);
      
      if (customError) {
        logger.warn('Error checking customized orders', { error: customError, orderId: id });
      } else if (customizedOrders && customizedOrders.length > 0) {
        // Update customized orders to remove order_id reference first
        const { error: updateError } = await supabaseAdmin
          .from('customized_orders')
          .update({ order_id: null })
          .eq('order_id', id);
        
        if (updateError) {
          logger.warn('Error updating customized orders', { error: updateError, orderId: id });
          // Continue anyway - might not be critical
        } else {
          logger.info('Updated customized orders to remove order reference', { 
            orderId: id, 
            count: customizedOrders.length 
          });
        }
      }
    } catch (error) {
      logger.warn('Error processing customized orders before deletion', { error, orderId: id });
      // Continue with deletion anyway
    }

    // Check for reviews that reference this order (they should have ON DELETE SET NULL)
    try {
      const { data: reviews, error: reviewsError } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('order_id', id);
      
      if (reviewsError) {
        logger.warn('Error checking reviews', { error: reviewsError, orderId: id });
      } else if (reviews && reviews.length > 0) {
        // Update reviews to remove order_id reference (should be SET NULL but let's be safe)
        const { error: updateError } = await supabaseAdmin
          .from('reviews')
          .update({ order_id: null })
          .eq('order_id', id);
        
        if (updateError) {
          logger.warn('Error updating reviews', { error: updateError, orderId: id });
          // Continue anyway
        } else {
          logger.info('Updated reviews to remove order reference', { 
            orderId: id, 
            count: reviews.length 
          });
        }
      }
    } catch (error) {
      logger.warn('Error processing reviews before deletion', { error, orderId: id });
      // Continue with deletion anyway
    }

    // Delete the order
    await dbOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          logger.error('Database delete error', error, { orderId: id });
          // Provide more detailed error message
          const errorMessage = (error as any)?.message || 'Unknown database error';
          const errorCode = (error as any)?.code || 'UNKNOWN';
          const errorDetails = (error as any)?.details || '';
          
          // Check for foreign key constraint violations
          if (errorMessage.includes('foreign key') || errorCode === '23503' || errorDetails.includes('foreign key')) {
            throw new DatabaseError(
              'Cannot delete order: It is referenced by other records. The system will attempt to clean up related records.',
              { originalError: errorMessage, code: errorCode, details: errorDetails }
            );
          }
          
          // Check for RLS policy violations
          if (errorMessage.includes('policy') || errorCode === '42501' || errorMessage.includes('permission denied')) {
            throw new AuthorizationError(
              'Cannot delete order: Insufficient permissions. Please check Row Level Security policies or ensure you are using the admin client.'
            );
          }
          
          // Check for not found errors
          if (errorCode === 'PGRST116' || errorMessage.includes('No rows')) {
            throw new NotFoundError('Order');
          }
          
          throw new DatabaseError(`Failed to delete order: ${errorMessage}`, { code: errorCode, details: errorDetails });
        }
        
        return { data, error: null };
      },
      'Failed to delete order'
    );

    logger.info('Order deleted successfully', { orderId: id });

    // Invalidate the customized order IDs cache since we may have updated them
    await cache.delete('customized_order_ids');

    return NextResponse.json({ 
      success: true,
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    logger.error('Error in DELETE /api/admin/orders', error, { ip: clientIP });
    return handleApiError(error);
  }
}
