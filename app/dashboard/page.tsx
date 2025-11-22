"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: Array<{
    quantity: number;
    unit_price: number;
    products?: {
      title: string;
      images: string[];
    };
  }>;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user orders
      const ordersRes = await fetch("/api/orders/user");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
        
        // Calculate stats
        const totalOrders = ordersData.orders?.length || 0;
        const pendingOrders = ordersData.orders?.filter((o: Order) => 
          o.status === "pending" || o.status === "processing"
        ).length || 0;
        const completedOrders = ordersData.orders?.filter((o: Order) => 
          o.status === "completed"
        ).length || 0;
        const totalSpent = ordersData.orders?.reduce((sum: number, o: Order) => 
          sum + parseFloat(o.total_amount?.toString() || "0"), 0
        ) || 0;

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <section className="max-w-6xl mx-auto mt-10 px-4">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-green-900">Loading...</p>
        </div>
      </section>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto mt-6 sm:mt-10 px-4 sm:px-0 mb-10">
      {/* Header */}
      <div className="glass rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-green-900 mb-2">
              Welcome back, {profile.full_name || "User"}!
            </h1>
            <p className="text-green-900">
              Manage your account, orders, and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/account"
              className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-green-900 hover:bg-emerald-500/30 transition-colors"
            >
              View Profile
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin.3layered.06082008/dashboard"
                className="px-4 py-2 bg-purple-500/20 border border-purple-400/40 rounded-lg text-green-900 hover:bg-purple-500/30 transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-green-900 mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-green-900">{stats.totalOrders}</div>
        </div>
        <div className="glass rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-green-900 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
        </div>
        <div className="glass rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-green-900 mb-1">Completed</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.completedOrders}</div>
        </div>
        <div className="glass rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-green-900 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-green-900">
            ₹{stats.totalSpent.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="md:col-span-1">
          <div className="glass rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/products"
                className="block p-4 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <p className="font-medium text-green-900">Shop Products</p>
                    <p className="text-sm text-green-900/70">Browse our catalog</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/cart"
                className="block p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="font-medium text-green-900">Shopping Cart</p>
                    <p className="text-sm text-green-900/70">View your cart</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/account"
                className="block p-4 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-medium text-green-900">Account Settings</p>
                    <p className="text-sm text-green-900/70">Manage profile</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/custom-print"
                className="block p-4 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <p className="font-medium text-green-900">Custom Print</p>
                    <p className="text-sm text-green-900/70">Request custom order</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="md:col-span-2">
          <div className="glass rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-900">Recent Orders</h2>
              {orders.length > 0 && (
                <Link
                  href="/orders"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  View All →
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-green-900 font-medium mb-2">No orders yet</p>
                <p className="text-sm text-green-900/70 mb-4">
                  Start shopping to see your orders here
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-green-900">
                            {order.order_number || `Order #${order.id.slice(0, 8)}`}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "completed"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : order.status === "pending"
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {order.status || "pending"}
                          </span>
                        </div>
                        <p className="text-sm text-green-900/70">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {order.order_items && order.order_items.length > 0 && (
                          <p className="text-xs text-green-900/60 mt-1">
                            {order.order_items.length} item{order.order_items.length > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-900 text-lg">
                          ₹{parseFloat(order.total_amount?.toString() || "0").toLocaleString()}
                        </p>
                        <p className="text-xs text-green-900/60">
                          {order.payment_status === "paid" ? "Paid" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

