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

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = orders?.reduce((sum, order) => 
      sum + parseFloat(order.total_amount || 0), 0
    ) || 0;

    // Get pending orders
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

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

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
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
      .limit(5);

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

