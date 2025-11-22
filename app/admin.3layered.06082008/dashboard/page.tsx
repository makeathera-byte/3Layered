"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated, getAdminSession } from "@/lib/adminAuth";

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      if (!isAdminAuthenticated()) {
        router.push("/admin.3layered.06082008/login");
        return;
      }
      
      setIsAuthorized(true);
      
      // Load stats
      try {
        setLoading(true);
        const session = getAdminSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${JSON.stringify(session)}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load stats");

        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoad();
  }, [router]);

  if (!mounted || !isAuthorized) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-800">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
      target: 100,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      target: 50,
    },
    {
      title: "Total Revenue",
      value: `₹${parseFloat(stats.totalRevenue.toString()).toLocaleString()}`,
      icon: "💰",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      rawValue: stats.totalRevenue,
      target: 100000,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      target: 100,
    },
  ];

  const alertCards = [
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
      description: "Orders awaiting processing",
      link: "/admin.3layered.06082008/orders",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts,
      icon: "⚠️",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      description: "Products running low",
      link: "/admin.3layered.06082008/products",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: "⭐",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-400",
      description: "Reviews to approve",
      link: "/admin.3layered.06082008/reviews",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-800 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Main Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-800 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl shadow-md`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {alertCards.map((alert, index) => (
            <Link
              key={index}
              href={alert.link}
              className={`${alert.bgColor} rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all group bg-white`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${alert.color} flex items-center justify-center text-2xl shadow-md`}>
                  {alert.icon}
                </div>
                <div className={`text-3xl font-bold ${alert.textColor}`}>{alert.value}</div>
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">{alert.title}</h3>
              <p className="text-sm text-gray-800">{alert.description}</p>
              <div className="mt-3 text-sm text-gray-700 group-hover:text-gray-700 transition-colors flex items-center gap-1">
                View details <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <Link
                href="/admin.3layered.06082008/orders"
                className="text-sm text-gray-800 hover:text-gray-800 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-800">No orders yet</p>
                  <p className="text-sm text-gray-700 mt-2">Orders will appear here once customers start buying</p>
                </div>
              ) : (
                recentOrders.map((order: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {order.order_number || `Order #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-800">
                          {order.users?.full_name || order.users?.email || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-lg">
                        ₹{parseFloat(order.total_amount || 0).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "pending"
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : order.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Link
              href="/admin.3layered.06082008/products"
              className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
              <p className="text-sm font-semibold text-gray-800">Manage Products</p>
              <p className="text-xs text-emerald-600 mt-1">{stats.totalProducts} products</p>
            </Link>
            <Link
              href="/admin.3layered.06082008/orders"
              className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛒</div>
              <p className="text-sm font-semibold text-gray-800">View Orders</p>
              <p className="text-xs text-emerald-600 mt-1">{stats.totalOrders} orders</p>
            </Link>
            <Link
              href="/admin.3layered.06082008/users"
              className="p-6 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <p className="text-sm font-semibold text-gray-800">Manage Users</p>
              <p className="text-xs text-purple-600 mt-1">{stats.totalUsers} users</p>
            </Link>
            <Link
              href="/admin.3layered.06082008/reviews"
              className="p-6 rounded-xl bg-pink-50 border border-pink-200 hover:border-pink-300 hover:shadow-md transition-all text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⭐</div>
              <p className="text-sm font-semibold text-gray-800">Review Reviews</p>
              <p className="text-xs text-pink-600 mt-1">{stats.pendingReviews} pending</p>
            </Link>
            <button
              onClick={() => {
                // Placeholder for add review functionality
                alert('Add Review feature coming soon!\n\nThis will allow you to:\n• Create sample reviews\n• Test review moderation\n• Manage customer feedback');
              }}
              className="p-6 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all text-center group cursor-pointer"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✍️</div>
              <p className="text-sm font-semibold text-gray-800">Add Review</p>
              <p className="text-xs text-amber-600 mt-1">Create new</p>
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">Order Status</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Completed</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.totalOrders - stats.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Pending</span>
                <span className="text-sm font-semibold text-orange-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Success Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.totalOrders > 0
                    ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">Inventory Health</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">In Stock</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.totalProducts - stats.lowStockProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Low Stock</span>
                <span className="text-sm font-semibold text-red-600">{stats.lowStockProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Health Score</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.totalProducts > 0
                    ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100)
                    : 100}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">Customer Engagement</h3>
              <span className="text-2xl">💬</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Total Users</span>
                <span className="text-sm font-semibold text-purple-600">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Pending Reviews</span>
                <span className="text-sm font-semibold text-pink-600">{stats.pendingReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800">Avg. Order Value</span>
                <span className="text-sm font-semibold text-purple-600">
                  ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
