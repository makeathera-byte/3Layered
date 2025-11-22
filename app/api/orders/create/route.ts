import { NextRequest, NextResponse } from "next/server";
import { validateOrderData, sanitizeString } from "@/lib/backend/validation";
import { handleApiError, ValidationError, DatabaseError } from "@/lib/backend/errors";
import { logger } from "@/lib/backend/logger";
import { rateLimit, getClientIP, validateRequestSize } from "@/lib/backend/security";
import { dbOperation, generateUniqueOrderNumber, prepareJSONBData, verifyTableStructure } from "@/lib/backend/database";
import { cache } from "@/lib/backend/cache";
import { performanceMonitor, batchOperation } from "@/lib/backend/performance";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    if (!rateLimit(`order:${clientIP}`, 10, 60000)) {
      logger.warn('Rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validate request size
    const body = await request.json();
    if (!validateRequestSize(body, 500)) {
      throw new ValidationError("Request payload too large");
    }

    logger.info('Order creation request received', { ip: clientIP });

    // Extract and sanitize data
    const {
      user_id,
      user_email,
      user_name,
      user_phone,
      shipping_address,
      items,
      subtotal,
      tax,
      shipping_fee,
      customization_fee,
      cod_fee,
      total_amount,
      payment_method,
      payment_status,
      order_notes,
    } = body;

    // Validate order data
    const validation = validateOrderData({
      user_email,
      shipping_address,
      items,
      total_amount,
      user_phone,
      payment_method,
    });

    if (!validation.valid) {
      logger.warn('Order validation failed', { errors: validation.errors, ip: clientIP });
      throw new ValidationError("Invalid order data", validation.errors);
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(user_email, 255);
    const sanitizedName = user_name ? sanitizeString(user_name, 100) : null;
    const sanitizedPhone = user_phone ? sanitizeString(user_phone, 20) : null;
    const sanitizedNotes = order_notes ? sanitizeString(order_notes, 1000) : null;

    // Verify table structure (cached for 5 minutes)
    const tableExists = await cache.getOrSet(
      'table:orders:exists',
      async () => verifyTableStructure('orders', ['items', 'shipping_address', 'order_notes']),
      5 * 60 * 1000 // 5 minutes
    );
    
    if (!tableExists) {
      throw new DatabaseError(
        "Database schema error: orders table is missing or incomplete",
        { hint: "Please run COMPLETE_ORDERS_TABLE_FIX.sql in Supabase SQL Editor" }
      );
    }

    // Generate unique order number with performance monitoring
    logger.debug('Generating order number');
    const orderNumber = await performanceMonitor.measure(
      'generate_order_number',
      () => generateUniqueOrderNumber()
    );

    // Prepare order data with proper rounding
    const orderData = {
      order_number: orderNumber,
      user_id: user_id || null,
      user_email: sanitizedEmail,
      user_name: sanitizedName,
      user_phone: sanitizedPhone,
      shipping_address: prepareJSONBData(shipping_address),
      items: prepareJSONBData(items),
      subtotal: Math.round(subtotal || total_amount || 0),
      tax: Math.round(tax || 0),
      shipping_fee: Math.round(shipping_fee || 0),
      total_amount: Math.round(total_amount),
      payment_method: payment_method || 'COD',
      payment_status: payment_status || 'pending',
      status: 'pending',
      order_notes: sanitizedNotes,
    };

    // Log fee breakdown for reference
    if (customization_fee !== undefined || cod_fee !== undefined) {
      logger.debug('Order fee breakdown', {
        subtotal: Math.round(subtotal || 0),
        customization_fee: customization_fee ? Math.round(customization_fee) : 0,
        cod_fee: cod_fee ? Math.round(cod_fee) : 0,
        total_amount: Math.round(total_amount)
      });
    }

    // Create order in database with transaction-like error handling and performance monitoring
    logger.debug('Inserting order into database', { orderNumber });
    const order = await performanceMonitor.measure(
      'create_order',
      async () => dbOperation(
        async () => {
          const { data, error } = await supabaseAdmin
            .from('orders')
            .insert(orderData)
            .select()
            .single();
          return { data, error };
        },
        'Failed to create order'
      )
    );

    logger.info('Order created successfully', { 
      orderId: order.id, 
      orderNumber: order.order_number,
      duration: Date.now() - startTime 
    });

    // Handle customized orders (non-blocking, batched for performance)
    const customizedItems = items.filter((item: any) => item.customization || item.isCustomized);
    
    if (customizedItems.length > 0) {
      logger.debug('Processing customized items', { count: customizedItems.length });
      
      // Process customized orders asynchronously in batches (don't block main order)
      // Use setImmediate to ensure response is sent first
      setImmediate(() => {
        processCustomizedOrders(customizedItems, {
          user_id,
          user_email: sanitizedEmail,
          user_name: sanitizedName,
          user_phone: sanitizedPhone,
          order_id: order.id
        }).catch(error => {
          // Log but don't fail the main order
          logger.error('Error processing customized orders', error, {
            orderId: order.id
          });
        });
      });
    }

    const response = NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      message: "Order created successfully",
    }, { status: 201 });

    // Add performance headers
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    
    return response;

  } catch (error) {
    logger.error('Order creation failed', error, { 
      ip: clientIP,
      duration: Date.now() - startTime 
    });
    return handleApiError(error);
  }
}

/**
 * Process customized orders (async, non-blocking, batched for performance)
 */
async function processCustomizedOrders(
  customizedItems: any[],
  userData: {
    user_id?: string | null;
    user_email: string;
    user_name?: string | null;
    user_phone?: string | null;
    order_id: string;
  }
): Promise<void> {
  // Process in batches of 5 for better performance
  await batchOperation(
    customizedItems,
    async (item: any) => {
    try {
      // Check for existing customized order
      let existingCustomizedOrder = null;
      
      if ((userData.user_id || userData.user_email) && item.product_id) {
        const { data: existing } = await supabaseAdmin
          .from('customized_orders')
          .select('id')
          .eq('product_id', item.product_id)
          .is('order_id', null)
          .limit(1)
          .maybeSingle();
        
        if (existing) {
          existingCustomizedOrder = existing;
        }
      }
      
      const customizedOrderData = {
        user_id: userData.user_id || null,
        user_email: userData.user_email,
        user_name: userData.user_name || null,
        user_phone: userData.user_phone || null,
        product_id: item.product_id || null,
        product_name: sanitizeString(item.product_name || 'Custom Product', 255),
        product_price: typeof item.price === 'number' ? Math.round(item.price) : null,
        customization_details: typeof item.customization === 'string' 
          ? sanitizeString(item.customization, 5000)
          : JSON.stringify(item.customization || {}),
        drive_link: item.drive_link ? sanitizeString(item.drive_link, 500) : null,
        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        status: 'pending',
        order_id: userData.order_id,
      };
      
      if (existingCustomizedOrder) {
        await dbOperation(
          async () => {
            const { data, error } = await supabaseAdmin
              .from('customized_orders')
              .update(customizedOrderData)
              .eq('id', existingCustomizedOrder.id)
              .select()
              .single();
            return { data, error };
          },
          `Failed to update customized order ${existingCustomizedOrder.id}`
        );
        logger.debug('Updated existing customized order', { id: existingCustomizedOrder.id });
      } else {
        await dbOperation(
          async () => {
            const { data, error } = await supabaseAdmin
              .from('customized_orders')
              .insert(customizedOrderData)
              .select()
              .single();
            return { data, error };
          },
          `Failed to create customized order for ${item.product_name}`
        );
        logger.debug('Created new customized order', { product: item.product_name });
      }
    } catch (error) {
      logger.error('Error processing customized item', error, { item: item.product_name });
      // Don't throw - we want to continue processing other items
      return null;
    }
    },
    5 // Batch size
  );
  
  logger.info('Customized orders processed', { 
    total: customizedItems.length 
  });
}

// GET endpoint to retrieve order by order number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number');
    
    if (!orderNumber) {
      throw new ValidationError("Order number is required");
    }

    // Sanitize order number
    const sanitizedOrderNumber = sanitizeString(orderNumber, 50);
    
    const order = await dbOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('order_number', sanitizedOrderNumber)
          .single();
        return { data, error };
      },
      'Failed to fetch order'
    );

    return NextResponse.json({
      success: true,
      order: order,
    });
    
  } catch (error) {
    logger.error('Error fetching order', error);
    return handleApiError(error);
  }
}
