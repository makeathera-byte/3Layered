import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    if (Date.now() > sessionData.expiresAt) return null;
    
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', sessionData.email)
      .eq('role', 'admin')
      .single();
    
    return user;
  } catch {
    return null;
  }
}

// GET - List all custom print orders
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional status filter

    let query = supabaseAdmin
      .from('custom_print_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching custom print orders:', error);
      
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
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    console.error('Error in GET /api/admin/custom-print:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

// PUT - Update custom print order status or details
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, quote_amount, quote_notes, admin_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (quote_amount !== undefined) updateData.quote_amount = quote_amount;
    if (quote_notes !== undefined) updateData.quote_notes = quote_notes;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data, error } = await supabaseAdmin
      .from('custom_print_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/custom-print:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a custom print order
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order to delete the file from storage
    const { data: order } = await supabaseAdmin
      .from('custom_print_orders')
      .select('file_url')
      .eq('id', id)
      .single();

    // Delete the file from storage if it exists
    if (order?.file_url) {
      try {
        // Extract bucket and path from URL
        const urlParts = order.file_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const [bucket, path] = urlParts[1].split('/');
          await supabaseAdmin.storage.from(bucket).remove([path]);
        }
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with order deletion even if file deletion fails
      }
    }

    // Delete the order
    const { error } = await supabaseAdmin
      .from('custom_print_orders')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/custom-print:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

