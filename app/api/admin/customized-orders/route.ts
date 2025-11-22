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

// GET - Get all customized orders (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('customized_orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: customizedOrders, error } = await query;
    
    if (error) {
      console.error('Error fetching customized orders:', error);
      
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('not found') || errorMessage.includes('schema cache')) {
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
        { error: `Failed to fetch orders: ${(error as any)?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Fetch full order details for customized orders that have order_id
    const orderIds = (customizedOrders || [])
      .map((co: any) => co.order_id)
      .filter(Boolean);
    
    let ordersData: any = {};
    if (orderIds.length > 0) {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .in('id', orderIds);
      
      if (orders) {
        orders.forEach((order: any) => {
          ordersData[order.id] = order;
        });
      }
    }

    // Combine customized orders with their full order data
    const data = (customizedOrders || []).map((co: any) => ({
      ...co,
      full_order: co.order_id ? ordersData[co.order_id] || null : null
    }));

    if (error) {
      console.error('Error fetching customized orders:', error);
      
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('not found') || errorMessage.includes('schema cache')) {
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
        { error: `Failed to fetch orders: ${(error as any)?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('customized_orders')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    return NextResponse.json({ 
      success: true, 
      orders: data || [],
      total: count || 0
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/customized-orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customized orders' },
      { status: 500 }
    );
  }
}

// PUT - Update a customized order (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, admin_notes, quote_amount } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (quote_amount !== undefined) updateData.quote_amount = quote_amount;

    const { data, error } = await supabaseAdmin
      .from('customized_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customized order:', error);
      return NextResponse.json(
        { error: `Failed to update order: ${(error as any)?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order: data
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/customized-orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update customized order' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a customized order (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted_at
    const { data, error } = await supabaseAdmin
      .from('customized_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting customized order:', error);
      return NextResponse.json(
        { error: `Failed to delete order: ${(error as any)?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully',
      order: data
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/customized-orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete customized order' },
      { status: 500 }
    );
  }
}

