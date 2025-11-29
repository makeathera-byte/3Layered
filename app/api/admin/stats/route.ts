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

// GET - Dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get customized order IDs to exclude from regular orders
    let customizedOrderIdSet = new Set<string>();
    try {
      const { data: customizedOrderIds, error: customError } = await supabaseAdmin
        .from('customized_orders')
        .select('order_id')
        .not('order_id', 'is', null)
        .is('deleted_at', null);
      
      if (customError) {
        console.warn('Error fetching customized order IDs:', customError);
      } else {
        customizedOrderIdSet = new Set(
          (customizedOrderIds || [])
            .map((co: any) => co.order_id)
            .filter(Boolean)
        );
      }
    } catch (error) {
      console.warn('Error processing customized order IDs:', error);
    }

    // Get total orders (excluding customized orders)
    let regularOrders: any[] = [];
    try {
      const { data: allOrders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('id, total_amount, payment_status, status');
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }
      
      regularOrders = (allOrders || []).filter(
        (order: any) => !customizedOrderIdSet.has(order.id)
      );
    } catch (error) {
      console.error('Error processing orders:', error);
      // Continue with empty array if orders fetch fails
      regularOrders = [];
    }

    const totalOrders = regularOrders.length;

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total revenue (excluding customized orders)
    const totalRevenue = regularOrders
      .filter((order: any) => order.payment_status === 'paid')
      .reduce((sum: number, order: any) => 
        sum + parseFloat(order.total_amount || 0), 0
      );

    // Get pending orders (excluding customized orders)
    const pendingOrders = regularOrders.filter(
      (order: any) => (order.status || 'pending') === 'pending'
    ).length;

    // Get low stock products
    const { count: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('inventory', 10)
      .is('deleted_at', null);

    // Get pending reviews
    const { count: pendingReviews } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    // Get recent orders (excluding customized orders)
    let recentOrders: any[] = [];
    try {
      const { data: allRecentOrders, error: recentError } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) {
        console.warn('Error fetching recent orders:', recentError);
      } else {
        recentOrders = (allRecentOrders || [])
          .filter((order: any) => !customizedOrderIdSet.has(order.id))
          .slice(0, 5);
      }
    } catch (error) {
      console.warn('Error processing recent orders:', error);
      // Continue with empty array if recent orders fetch fails
      recentOrders = [];
    }

    return NextResponse.json({
      stats: {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalUsers: totalUsers || 0,
        totalRevenue: Math.round(totalRevenue),
        pendingOrders: pendingOrders || 0,
        lowStockProducts: lowStockProducts || 0,
        pendingReviews: pendingReviews || 0
      },
      recentOrders: recentOrders || []
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

