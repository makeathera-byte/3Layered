import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// POST - Create a new custom print order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      user_email, 
      user_name, 
      user_phone, 
      description,
      drive_link
    } = body;

    // Validate required fields
    if (!user_email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Project description is required' },
        { status: 400 }
      );
    }

    // Create the order
    const { data, error } = await supabaseAdmin
      .from('custom_print_orders')
      .insert({
        user_id: user_id || null,
        user_email,
        user_name: user_name || null,
        user_phone: user_phone || null,
        file_url: null,
        file_name: null,
        file_size: null,
        description: description,
        drive_link: drive_link || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom print order:', error);
      
      // Check if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          {
            error: 'Custom print orders table not found',
            details: 'The "custom_print_orders" table does not exist in your database.',
            instructions: 'Run the SQL in CREATE_CUSTOM_PRINT_ORDERS_TABLE.sql file in your Supabase SQL Editor to create the table.',
            sqlFile: 'CREATE_CUSTOM_PRINT_ORDERS_TABLE.sql'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create order: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order: data,
      message: 'Custom print order submitted successfully! We will review your request and get back to you soon.'
    });
  } catch (error: any) {
    console.error('Error in POST /api/custom-print:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

