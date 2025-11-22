import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeEmail, sanitizeString, sanitizeURL } from '@/lib/security/input-sanitizer';
import { rateLimit, getClientIP } from '@/lib/backend/security';
import { logger } from '@/lib/backend/logger';
import { handleApiError, ValidationError } from '@/lib/backend/errors';

// POST - Create a new customized order
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    if (!rateLimit(`customized-order:${clientIP}`, 5, 60000)) {
      logger.warn('Customized order rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      user_id, 
      user_email, 
      user_name, 
      user_phone,
      product_id,
      product_name,
      product_price,
      customization_details,
      drive_link,
      quantity
    } = body;

    // Sanitize inputs
    const sanitizedEmail = user_email ? sanitizeEmail(user_email) : null;
    const sanitizedName = user_name ? sanitizeString(user_name, 100) : null;
    const sanitizedPhone = user_phone ? sanitizeString(user_phone, 20) : null;
    const sanitizedProductName = product_name ? sanitizeString(product_name, 255) : null;
    const sanitizedDetails = customization_details ? sanitizeString(customization_details, 5000) : null;
    const sanitizedDriveLink = drive_link ? sanitizeURL(drive_link) : null;

    // Validate required fields
    if (!sanitizedDetails || !sanitizedDetails.trim()) {
      throw new ValidationError('Customization details are required');
    }

    if (!sanitizedEmail) {
      throw new ValidationError('Valid email is required');
    }

    if (!sanitizedProductName) {
      throw new ValidationError('Product name is required');
    }

    // Create the customized order with sanitized data
    const { data, error } = await supabaseAdmin
      .from('customized_orders')
      .insert({
        user_id: user_id || null,
        user_email: sanitizedEmail,
        user_name: sanitizedName,
        user_phone: sanitizedPhone,
        product_id: product_id || null,
        product_name: sanitizedProductName,
        product_price: typeof product_price === 'number' ? Math.round(product_price) : null,
        customization_details: sanitizedDetails.trim(),
        drive_link: sanitizedDriveLink,
        quantity: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating customized order', error, { ip: clientIP });
      
      // Check if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          {
            error: 'Customized orders table not found',
            details: 'The "customized_orders" table does not exist in your database.',
            instructions: 'Run the SQL in CREATE_CUSTOMIZED_ORDERS_TABLE.sql file in your Supabase SQL Editor to create the table.',
            sqlFile: 'CREATE_CUSTOMIZED_ORDERS_TABLE.sql'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create customized order: ${error.message}` },
        { status: 500 }
      );
    }

    logger.info('Customized order created', { orderId: data.id, ip: clientIP });

    return NextResponse.json({ 
      success: true, 
      order: data,
      message: 'Customization request submitted successfully! Our team will call you to take more details about your customization.'
    });
  } catch (error) {
    logger.error('Error in POST /api/customized-orders', error, { ip: clientIP });
    return handleApiError(error);
  }
}

// GET - Get user's customized orders (if authenticated)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user_email');
    const userId = searchParams.get('user_id');

    if (!userEmail && !userId) {
      return NextResponse.json(
        { error: 'user_email or user_id is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('customized_orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customized orders:', error);
      
      if (error.message?.includes('not found') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          {
            error: 'Customized orders table not found',
            details: 'The "customized_orders" table does not exist in your database.',
            instructions: 'Run the SQL in CREATE_CUSTOMIZED_ORDERS_TABLE.sql file in your Supabase SQL Editor to create the table.',
            sqlFile: 'CREATE_CUSTOMIZED_ORDERS_TABLE.sql'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch orders: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      orders: data || []
    });
  } catch (error: any) {
    console.error('Error in GET /api/customized-orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customized orders' },
      { status: 500 }
    );
  }
}

