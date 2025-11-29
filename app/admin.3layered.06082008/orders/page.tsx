"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminOrdersAPI } from "@/lib/admin-api";
import { formatDateLocale, formatTimeLocale } from "@/lib/dateUtils";

export default function AdminOrders() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadOrders();
    }
  }, [router, mounted]);

  const loadOrders = async (forceRefresh = false) => {
    try {
      setLoading(true);
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      const data = await adminOrdersAPI.getAll(cacheBuster);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await adminOrdersAPI.updateStatus(orderId, { status: newStatus });
      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      await loadOrders(true); // Force refresh after update
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
      // Reload orders on error to ensure state is correct (force refresh)
      await loadOrders(true);
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert(`Failed to copy ${label}`);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(orderId);
      console.log('[Delete Order] Attempting to delete order:', { orderId, orderNumber });
      
      const result = await adminOrdersAPI.delete(orderId);
      console.log('[Delete Order] Delete successful:', result);
      
      // Show success message
      alert(`Order ${orderNumber} deleted successfully!`);
      
      // Remove the order from the local state immediately for better UX
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      // Then reload with force refresh to ensure consistency (bypass cache)
      await loadOrders(true);
    } catch (error: any) {
      console.error("[Delete Order] Error deleting order:", error);
      console.error("[Delete Order] Error details:", {
        message: error?.message,
        error: error?.error,
        details: error?.details,
        code: error?.code,
        stack: error?.stack
      });
      
      // Extract detailed error message
      let errorMessage = 'Unknown error';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.details?.error) {
        errorMessage = error.details.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show detailed error to user
      alert(`Failed to delete order: ${errorMessage}\n\nOrder Number: ${orderNumber}\n\nIf this persists, please check:\n1. The order is not referenced by other records\n2. You have proper admin permissions\n3. Check the browser console (F12) for more details`);
      
      // Reload orders on error to ensure state is correct (force refresh)
      await loadOrders(true);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter orders based on selected status and payment status
  const filteredOrders = orders.filter(order => {
    // Filter by order status
    const statusMatch = filterStatus === "all" 
      ? true
      : filterStatus === "delivered"
      ? (order.status || "pending") === "delivered" || (order.status || "pending") === "completed"
      : (order.status || "pending") === filterStatus;
    
    // Filter by payment status (exclude failed by default unless explicitly requested)
    const paymentMatch = filterPaymentStatus === "all"
      ? (order.payment_status || "pending") !== "failed" // Hide failed by default
      : filterPaymentStatus === "show-failed"
      ? true // Show all including failed
      : (order.payment_status || "pending") === filterPaymentStatus;
    
    return statusMatch && paymentMatch;
  });

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => (o.status || "pending") === "pending").length,
    processing: orders.filter(o => (o.status || "pending") === "processing").length,
    shipped: orders.filter(o => (o.status || "pending") === "shipped").length,
    delivered: orders.filter(o => (o.status || "pending") === "delivered" || (o.status || "pending") === "completed").length,
    cancelled: orders.filter(o => (o.status || "pending") === "cancelled").length,
  };

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-800">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
            <p className="text-gray-800 mt-2">Manage customer orders</p>
          </div>
          <button
            onClick={() => loadOrders(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filter Categories */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          {/* Payment Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Status:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterPaymentStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filterPaymentStatus === "all"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hide Failed
              </button>
              <button
                onClick={() => setFilterPaymentStatus("show-failed")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filterPaymentStatus === "show-failed"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Show All (Including Failed)
              </button>
            </div>
          </div>
          
          {/* Order Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Order Status:</label>
            <div className="flex flex-wrap gap-2">
              <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "all"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Orders ({orderCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ⏳ Pending ({orderCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus("processing")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "processing"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔄 Processing ({orderCounts.processing})
            </button>
            <button
              onClick={() => setFilterStatus("shipped")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "shipped"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📦 Shipped ({orderCounts.shipped})
            </button>
            <button
              onClick={() => setFilterStatus("delivered")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "delivered"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✅ Delivered/Completed ({orderCounts.delivered})
            </button>
            <button
              onClick={() => setFilterStatus("cancelled")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === "cancelled"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ❌ Cancelled ({orderCounts.cancelled})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-800 text-lg">
              {filterStatus === "all" 
                ? "No orders yet" 
                : `No ${filterStatus} orders found`}
            </p>
            {filterStatus !== "all" && (
              <button
                onClick={() => setFilterStatus("all")}
                className="mt-4 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            {filteredOrders.map((order) => {
              // Parse items from JSONB
              const items = Array.isArray(order.items) ? order.items : [];
              // Parse shipping address from JSONB
              const address = order.shipping_address || {};
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {order.order_number || `Order #${order.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 text-sm font-medium">
                          {order.user_name || "Guest"}
                        </p>
                        {order.user_name && (
                          <button
                            onClick={() => copyToClipboard(order.user_name, "Name")}
                            className="text-xs text-emerald-600 hover:text-emerald-700"
                            title="Copy name"
                          >
                            📋
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 text-xs mt-1">
                        {mounted ? (
                          <>
                            {formatDateLocale(order.created_at)} at {formatTimeLocale(order.created_at)}
                          </>
                        ) : (
                          <span className="text-transparent">Loading...</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{Math.round(parseFloat(order.total_amount || 0)).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {items.length} item(s)
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Email</p>
                        {order.user_email && (
                          <button
                            onClick={() => copyToClipboard(order.user_email, "Email")}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            title="Copy email"
                          >
                            📋 Copy
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{order.user_email || "N/A"}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Phone</p>
                        {order.user_phone && (
                          <button
                            onClick={() => copyToClipboard(order.user_phone, "Phone")}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            title="Copy phone"
                          >
                            📋 Copy
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{order.user_phone || "N/A"}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600 font-medium">Shipping Address</p>
                      {address.flat_number || address.colony || address.city ? (
                        <button
                          onClick={() => {
                            const fullAddress = [
                              address.flat_number,
                              address.colony,
                              address.city,
                              address.state,
                              address.pincode
                            ].filter(Boolean).join(", ");
                            copyToClipboard(fullAddress, "Address");
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          title="Copy address"
                        >
                          📋 Copy
                        </button>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-800">
                      {address.flat_number && `${address.flat_number}, `}
                      {address.colony && `${address.colony}, `}
                      {address.city && `${address.city}, `}
                      {address.state && `${address.state} - `}
                      {address.pincode && address.pincode}
                      {!address.flat_number && !address.colony && !address.city && !address.state && !address.pincode && "N/A"}
                    </p>
                  </div>

                  {/* Order Items */}
                  {items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-800 mb-3">Order Items:</p>
                      <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {item.product_name || "Product"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Quantity: {item.quantity || 1} × ₹{Math.round(parseFloat(item.price || 0)).toLocaleString()}
                              </p>
                              {item.customization && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                  Customized
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-800">
                                ₹{Math.round(parseFloat(item.subtotal || item.price * (item.quantity || 1) || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-semibold text-gray-800">
                          ₹{Math.round(parseFloat(order.subtotal || order.total_amount || 0)).toLocaleString()}
                        </span>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Tax:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{Math.round(parseFloat(order.tax || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {order.shipping_fee > 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Shipping:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{Math.round(parseFloat(order.shipping_fee || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                        <span className="text-base font-bold text-gray-800">Total Amount:</span>
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{Math.round(parseFloat(order.total_amount || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {order.order_notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Order Notes</p>
                      <p className="text-sm text-gray-800 italic">{order.order_notes}</p>
                    </div>
                  )}

                  {/* Status Controls */}
                  <div className="flex items-center justify-between flex-wrap mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 font-medium">Status:</span>
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 text-sm disabled:opacity-50 font-medium"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">🔄 Processing</option>
                          <option value="shipped">📦 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="completed">✅ Completed</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 font-medium">Payment:</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}>
                          {order.payment_status || "pending"}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteOrder(order.id, order.order_number || order.id.slice(0, 8))}
                      disabled={deletingId === order.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Delete this order"
                    >
                      {deletingId === order.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
