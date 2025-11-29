import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay/config";
import { handleApiError, ValidationError, DatabaseError } from "@/lib/backend/errors";
import { logger } from "@/lib/backend/logger";
import { rateLimit, getClientIP } from "@/lib/backend/security";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateUniqueOrderNumber, prepareJSONBData } from "@/lib/backend/database";
import { sanitizeString } from "@/lib/backend/validation";
import { sanitizeEmail, sanitizePhone } from "@/lib/security/input-sanitizer";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    if (!rateLimit(`razorpay:verify:${clientIP}`, 30, 60000)) {
      logger.warn('Rate limit exceeded for Razorpay payment verification', { ip: clientIP });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, order_data } = body;

    // Log incoming request for debugging
    logger.info('Payment verification request received', {
      has_razorpay_order_id: !!razorpay_order_id,
      has_razorpay_payment_id: !!razorpay_payment_id,
      has_razorpay_signature: !!razorpay_signature,
      has_order_id: !!order_id,
      has_order_data: !!order_data,
      order_data_keys: order_data ? Object.keys(order_data) : []
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ValidationError("Missing required payment verification fields");
    }
    
    // Validate that either order_data or order_id is provided
    if (!order_data && !order_id) {
      throw new ValidationError("Either order_data or order_id must be provided");
    }

    logger.info('Verifying Razorpay payment', { 
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      ip: clientIP 
    });

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay key secret is not configured');
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      logger.warn('Razorpay signature verification failed', { 
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        ip: clientIP 
      });
      throw new ValidationError("Payment verification failed. Invalid signature.");
    }

    logger.info('Razorpay signature verified successfully', { 
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id 
    });

    let createdOrder = null;
    let orderNumber = null;

    // If order_data is provided, create the order NOW (after successful payment)
    if (order_data) {
      try {
        logger.info('Creating order after successful payment verification', { 
          razorpay_order_id,
          razorpay_payment_id,
          hasOrderData: !!order_data,
          orderDataKeys: order_data ? Object.keys(order_data) : []
        });

        // Validate order_data structure
        if (!order_data.user_email) {
          throw new ValidationError("Missing user_email in order_data");
        }
        if (!order_data.shipping_address) {
          throw new ValidationError("Missing shipping_address in order_data");
        }
        if (!order_data.items || !Array.isArray(order_data.items) || order_data.items.length === 0) {
          throw new ValidationError("Missing or invalid items in order_data");
        }
        if (!order_data.total_amount || order_data.total_amount <= 0) {
          throw new ValidationError("Missing or invalid total_amount in order_data");
        }

        // Generate unique order number
        const newOrderNumber = await generateUniqueOrderNumber();

        // Prepare order data with payment information
        const orderDataToCreate = {
          order_number: newOrderNumber,
          user_id: order_data.user_id || null,
          user_email: sanitizeEmail(order_data.user_email),
          user_name: order_data.user_name ? sanitizeString(order_data.user_name, 100) : null,
          user_phone: order_data.user_phone ? sanitizePhone(order_data.user_phone) : null,
          shipping_address: prepareJSONBData(order_data.shipping_address),
          items: prepareJSONBData(order_data.items),
          subtotal: Math.round(order_data.subtotal || order_data.total_amount || 0),
          tax: Math.round(order_data.tax || 0),
          shipping_fee: Math.round(order_data.shipping_fee || 0),
          total_amount: Math.round(order_data.total_amount),
          payment_method: 'razorpay',
          payment_status: 'paid', // Payment is already verified
          status: 'confirmed', // Order is confirmed since payment is successful
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          order_notes: order_data.order_notes ? sanitizeString(order_data.order_notes, 1000) : null,
        };

        logger.info('Order data prepared for insertion', {
          order_number: newOrderNumber,
          user_email: orderDataToCreate.user_email,
          item_count: Array.isArray(order_data.items) ? order_data.items.length : 0,
          total_amount: orderDataToCreate.total_amount
        });

        const { data: newOrder, error: createError } = await supabaseAdmin
          .from('orders')
          .insert(orderDataToCreate)
          .select()
          .single();

        if (createError) {
          logger.error('Failed to create order after payment', createError, { 
            razorpay_order_id,
            razorpay_payment_id,
            order_number: newOrderNumber,
            error_code: createError.code,
            error_message: createError.message,
            error_details: createError.details,
            error_hint: createError.hint
          });
          
          // Provide more detailed error message
          const errorMessage = createError.message || 'Unknown database error';
          const errorCode = createError.code || 'UNKNOWN';
          const errorDetails = createError.details || '';
          const errorHint = createError.hint || '';
          
          throw new DatabaseError(
            `Failed to create order after payment: ${errorMessage}`,
            { 
              code: errorCode,
              details: errorDetails,
              hint: errorHint,
              razorpay_order_id,
              razorpay_payment_id,
              order_number: newOrderNumber
            }
          );
        }

        createdOrder = newOrder;
        orderNumber = newOrder.order_number;

        logger.info('Order created successfully after payment verification', { 
          order_id: newOrder.id,
          order_number: newOrder.order_number,
          razorpay_payment_id 
        });

        // Handle customized orders if any
        const customizedItems = (order_data.items || []).filter((item: any) => item.customization || item.isCustomized);
        if (customizedItems.length > 0) {
          try {
            const customizedOrdersToInsert = customizedItems.map((item: any) => ({
              user_id: order_data.user_id || null,
              user_email: sanitizeEmail(order_data.user_email),
              user_name: order_data.user_name ? sanitizeString(order_data.user_name, 100) : null,
              user_phone: order_data.user_phone ? sanitizePhone(order_data.user_phone) : null,
              product_id: item.product_id || null,
              product_name: sanitizeString(item.product_name || 'Custom Product', 255),
              product_price: typeof item.price === 'number' ? Math.round(item.price) : null,
              customization_details: typeof item.customization === 'string' 
                ? sanitizeString(item.customization, 5000)
                : JSON.stringify(item.customization || {}),
              drive_link: item.drive_link ? sanitizeString(item.drive_link, 500) : null,
              quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
              status: 'pending',
              order_id: newOrder.id,
            }));

            const { error: customizedError } = await supabaseAdmin
              .from('customized_orders')
              .insert(customizedOrdersToInsert);

            if (customizedError) {
              logger.error('Error creating customized orders', customizedError, { order_id: newOrder.id });
              // Don't fail the main order creation if customized orders fail
            } else {
              logger.info('Customized orders created successfully', { count: customizedItems.length, order_id: newOrder.id });
            }
          } catch (error) {
            logger.error('Error processing customized orders', error, { order_id: newOrder.id });
            // Don't fail the main order creation if customized orders fail
          }
        }

      } catch (createError: any) {
        logger.error('Error creating order after payment', createError, { 
          razorpay_order_id,
          razorpay_payment_id,
          error_type: createError.constructor?.name,
          error_message: createError.message,
          error_stack: createError.stack
        });
        
        // If it's already a DatabaseError or ValidationError, re-throw it
        if (createError instanceof DatabaseError || createError instanceof ValidationError) {
          throw createError;
        }
        
        // Otherwise, wrap it in a DatabaseError
        throw new DatabaseError(
          `Payment verified but failed to create order: ${createError.message || 'Unknown error'}`,
          { 
            originalError: createError.message,
            razorpay_order_id,
            razorpay_payment_id
          }
        );
      }
    } else if (order_id) {
      // Legacy: If order_id is provided, update existing order (for backward compatibility)
      try {
        const { data: order, error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: 'razorpay',
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order_id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update order after payment', updateError, { order_id });
          throw new Error(`Failed to update order: ${updateError.message}`);
        } else {
          createdOrder = order;
          orderNumber = order?.order_number;
          logger.info('Order updated after successful payment', { 
            order_id: order?.id,
            order_number: order?.order_number 
          });
        }
      } catch (updateError: any) {
        logger.error('Error updating order after payment', updateError, { order_id });
        throw updateError;
      }
    } else {
      throw new ValidationError("Either order_data or order_id must be provided");
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: createdOrder?.id || order_id,
      order_number: orderNumber,
    });

  } catch (error: any) {
    logger.error('Razorpay payment verification failed', error, { 
      ip: clientIP,
      error_type: error.constructor?.name,
      error_message: error.message,
      error_code: error.code,
      error_details: error.details,
      error_stack: error.stack
    });
    
    // Return more detailed error response for better debugging
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          verified: false
        },
        { status: error.statusCode }
      );
    }
    
    return handleApiError(error);
  }
}

