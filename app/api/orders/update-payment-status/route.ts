import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { handleApiError, ValidationError } from '@/lib/backend/errors';
import { logger } from '@/lib/backend/logger';
import { rateLimit, getClientIP } from '@/lib/backend/security';
import { validateUUID } from '@/lib/backend/validation';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    if (!rateLimit(`update-payment:${clientIP}`, 20, 60000)) {
      logger.warn('Rate limit exceeded for payment status update', { ip: clientIP });
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.error('Failed to parse request body', parseError);
      throw new ValidationError('Invalid request body');
    }

    const { order_id, payment_status, payment_error } = body;

    if (!order_id || !validateUUID(order_id)) {
      throw new ValidationError('Valid order ID is required');
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!payment_status || !validPaymentStatuses.includes(payment_status)) {
      throw new ValidationError(`Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
    }

    logger.info('Updating order payment status', { 
      orderId: order_id, 
      paymentStatus: payment_status,
      ip: clientIP 
    });

    // Update order payment status
    const updateData: any = {
      payment_status: payment_status,
      updated_at: new Date().toISOString(),
    };

    // Add payment error to order notes if provided
    if (payment_error && payment_status === 'failed') {
      try {
        const { data: existingOrder, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('order_notes')
          .eq('id', order_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          logger.warn('Error fetching existing order notes', { error: fetchError, orderId: order_id });
        }

        const existingNotes = existingOrder?.order_notes || '';
        const errorNote = `[Payment Failed] ${payment_error}`;
        updateData.order_notes = existingNotes 
          ? `${existingNotes}\n${errorNote}`
          : errorNote;
      } catch (notesError) {
        logger.warn('Error processing payment error notes', { error: notesError, orderId: order_id });
        // Continue without notes if there's an error
      }
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update order payment status', error, { orderId: order_id });
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    if (!order) {
      throw new ValidationError('Order not found');
    }

    logger.info('Order payment status updated successfully', { 
      orderId: order_id, 
      paymentStatus: payment_status 
    });

    return NextResponse.json({ 
      success: true,
      order: order,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    logger.error('Error in POST /api/orders/update-payment-status', error, { ip: clientIP });
    return handleApiError(error);
  }
}

