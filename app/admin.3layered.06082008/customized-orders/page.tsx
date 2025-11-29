"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminCustomizedOrdersAPI } from "@/lib/admin-api";
import { formatDateTimeLocale } from "@/lib/dateUtils";

// Contact support number
const CONTACT_SUPPORT_NUMBER = "+919982781000";

interface CustomizedOrder {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  product_id: string | null;
  product_name: string;
  product_price: number | null;
  customization_details: string;
  drive_link: string | null;
  quantity: number;
  status: string;
  admin_notes: string | null;
  quote_amount: number | null;
  order_id: string | null;
  created_at: string;
  updated_at: string | null;
  full_order?: any | null; // Full order details when order_id exists
}

export default function AdminCustomizedOrders() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomizedOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomizedOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<CustomizedOrder | null>(null);
  const [updating, setUpdating] = useState(false);
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
  }, [router, mounted, filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const status = filterStatus === "all" ? undefined : filterStatus;
      const data = await adminCustomizedOrdersAPI.getAll(status);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error("Error loading customized orders:", error);
      alert(`Failed to load orders: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      await adminCustomizedOrdersAPI.update(orderId, { status: newStatus });
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      await loadOrders();
      setEditingOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Failed to update order: ${error.message || "Unknown error"}`);
      await loadOrders();
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setUpdating(true);
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const updates = {
        status: formData.get("status") as string,
        quote_amount: formData.get("quote_amount") ? parseFloat(formData.get("quote_amount") as string) : undefined,
        admin_notes: formData.get("admin_notes") as string || undefined,
      };
      await adminCustomizedOrdersAPI.update(editingOrder.id, updates);
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === editingOrder.id ? { 
            ...order, 
            status: updates.status || order.status,
            quote_amount: updates.quote_amount !== undefined ? updates.quote_amount : order.quote_amount,
            admin_notes: updates.admin_notes !== undefined ? (updates.admin_notes || null) : order.admin_notes
          } : order
        )
      );
      await loadOrders();
      setEditingOrder(null);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Failed to update order: ${error.message || "Unknown error"}`);
      await loadOrders();
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this customized order?")) {
      return;
    }

    try {
      setDeletingId(orderId);
      await adminCustomizedOrdersAPI.delete(orderId);
      // Remove the order from the local state immediately for better UX
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      // Then reload to ensure consistency
      await loadOrders();
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      alert(`Failed to delete order: ${error.message || "Unknown error"}`);
      // Reload orders on error to ensure state is correct
      await loadOrders();
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-900 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      // Server-side: return safe format
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16).replace('T', ' ');
    }
    return formatDateTimeLocale(dateString, "en-IN");
  };

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-green-900 text-lg">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customized Orders</h1>
            <p className="text-gray-800 mt-1">Manage product customization requests</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-800">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-800 text-lg">No customized orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{order.product_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                      <div>
                        <span className="font-semibold">Customer:</span> {order.user_name || order.user_email}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {order.user_email}
                      </div>
                      {order.user_phone && (
                        <div>
                          <span className="font-semibold">Phone:</span>{" "}
                          <a href={`tel:${order.user_phone}`} className="text-emerald-600 hover:underline">
                            {order.user_phone}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Quantity:</span> {order.quantity}
                      </div>
                      {order.product_price && (
                        <div>
                          <span className="font-semibold">Product Price:</span> ₹{order.product_price.toLocaleString()}
                        </div>
                      )}
                      {order.quote_amount && (
                        <div>
                          <span className="font-semibold">Quote Amount:</span>{" "}
                          <span className="text-emerald-600 font-bold">₹{order.quote_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Created:</span> {formatDate(order.created_at)}
                      </div>
                      {order.full_order && (
                        <>
                          <div className="col-span-2 mt-2 pt-2 border-t border-gray-300">
                            <span className="font-semibold text-emerald-600">Order Number:</span> {order.full_order.order_number}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold text-emerald-600">Total Amount:</span>{" "}
                            <span className="text-lg font-bold text-emerald-600">
                              ₹{Math.round(parseFloat(order.full_order.total_amount || 0)).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {deletingId === order.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Customization Details:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{order.customization_details}</p>
                </div>

                {order.drive_link && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-700 mb-2">Google Drive Link:</p>
                    <a 
                      href={order.drive_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium flex items-center gap-2 break-all"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Files
                    </a>
                  </div>
                )}

                {order.admin_notes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Admin Notes:</p>
                    <p className="text-blue-800 whitespace-pre-wrap">{order.admin_notes}</p>
                  </div>
                )}

                {/* Full Order Details */}
                {order.full_order && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
                      <h4 className="text-lg font-bold text-emerald-700 mb-3">📦 Complete Order Information</h4>
                      
                      {/* Order Summary */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Order Number:</span>
                          <p className="text-gray-800 font-mono">{order.full_order.order_number}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Payment Method:</span>
                          <p className="text-gray-800">{order.full_order.payment_method || "COD"}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Payment Status:</span>
                          <p className={`inline-block px-2 py-1 rounded text-xs ${
                            order.full_order.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {order.full_order.payment_status || "pending"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Order Status:</span>
                          <p className="text-gray-800">{order.full_order.status || "pending"}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.full_order.shipping_address && (
                        <div className="mb-4 p-3 bg-white rounded border border-emerald-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Shipping Address:</p>
                          <p className="text-sm text-gray-800">
                            {order.full_order.shipping_address.flat_number && `${order.full_order.shipping_address.flat_number}, `}
                            {order.full_order.shipping_address.colony && `${order.full_order.shipping_address.colony}, `}
                            {order.full_order.shipping_address.city && `${order.full_order.shipping_address.city}, `}
                            {order.full_order.shipping_address.state && `${order.full_order.shipping_address.state} - `}
                            {order.full_order.shipping_address.pincode && order.full_order.shipping_address.pincode}
                          </p>
                        </div>
                      )}

                      {/* All Order Items */}
                      {order.full_order.items && Array.isArray(order.full_order.items) && order.full_order.items.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-600 mb-2">All Order Items:</p>
                          <div className="space-y-2">
                            {order.full_order.items.map((item: any, idx: number) => (
                              <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.product_name || "Product"}</p>
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
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Breakdown */}
                      <div className="p-3 bg-white rounded border border-emerald-200">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-800 font-semibold">
                              ₹{Math.round(parseFloat(order.full_order.subtotal || order.full_order.total_amount || 0)).toLocaleString()}
                            </span>
                          </div>
                          {order.full_order.tax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="text-gray-800 font-semibold">
                                ₹{Math.round(parseFloat(order.full_order.tax || 0)).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {order.full_order.shipping_fee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="text-gray-800 font-semibold">
                                ₹{Math.round(parseFloat(order.full_order.shipping_fee || 0)).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-bold text-gray-800">Total Amount:</span>
                            <span className="text-lg font-bold text-emerald-600">
                              ₹{Math.round(parseFloat(order.full_order.total_amount || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.full_order.order_notes && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Order Notes:</p>
                          <p className="text-sm text-gray-800 italic">{order.full_order.order_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-700 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Product</h3>
                    <p className="text-gray-800">{selectedOrder.product_name}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Customer Information</h3>
                    <div className="space-y-1 text-gray-800">
                      <p>Name: {selectedOrder.user_name || "N/A"}</p>
                      <p>Email: {selectedOrder.user_email}</p>
                      {selectedOrder.user_phone && <p>Phone: {selectedOrder.user_phone}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Order Information</h3>
                    <div className="space-y-1 text-gray-800">
                      <p>Quantity: {selectedOrder.quantity}</p>
                      {selectedOrder.product_price && <p>Product Price: ₹{selectedOrder.product_price.toLocaleString()}</p>}
                      {selectedOrder.quote_amount && (
                        <p className="text-emerald-600 font-bold">Quote Amount: ₹{selectedOrder.quote_amount.toLocaleString()}</p>
                      )}
                      <p>Status: <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.replace("_", " ").toUpperCase()}
                      </span></p>
                      <p>Created: {formatDate(selectedOrder.created_at)}</p>
                      {selectedOrder.updated_at && <p>Updated: {formatDate(selectedOrder.updated_at)}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Customization Details</h3>
                    <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedOrder.customization_details}
                    </p>
                  </div>

                  {selectedOrder.drive_link && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Google Drive Link</h3>
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                        <a 
                          href={selectedOrder.drive_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium flex items-center gap-2 break-all"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Files in New Tab
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedOrder.admin_notes && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Admin Notes</h3>
                      <p className="text-gray-800 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                        {selectedOrder.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Full Order Information */}
                  {selectedOrder.full_order && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border-2 border-emerald-200">
                      <h3 className="font-bold text-emerald-700 mb-3 text-lg">📦 Complete Order Information</h3>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Order Number:</span>
                          <p className="text-gray-800 font-mono">{selectedOrder.full_order.order_number}</p>
                        </div>
                        
                        {selectedOrder.full_order.shipping_address && (
                          <div>
                            <span className="font-semibold text-gray-700">Shipping Address:</span>
                            <p className="text-gray-800">
                              {selectedOrder.full_order.shipping_address.flat_number && `${selectedOrder.full_order.shipping_address.flat_number}, `}
                              {selectedOrder.full_order.shipping_address.colony && `${selectedOrder.full_order.shipping_address.colony}, `}
                              {selectedOrder.full_order.shipping_address.city && `${selectedOrder.full_order.shipping_address.city}, `}
                              {selectedOrder.full_order.shipping_address.state && `${selectedOrder.full_order.shipping_address.state} - `}
                              {selectedOrder.full_order.shipping_address.pincode && selectedOrder.full_order.shipping_address.pincode}
                            </p>
                          </div>
                        )}

                        {selectedOrder.full_order.items && Array.isArray(selectedOrder.full_order.items) && selectedOrder.full_order.items.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700 mb-2 block">All Order Items:</span>
                            <div className="space-y-2">
                              {selectedOrder.full_order.items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                  <p className="font-medium text-gray-800">{item.product_name || "Product"}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity || 1} × ₹{Math.round(parseFloat(item.price || 0)).toLocaleString()}</p>
                                  <p className="text-sm font-semibold text-gray-800 mt-1">
                                    ₹{Math.round(parseFloat(item.subtotal || item.price * (item.quantity || 1) || 0)).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-3 rounded border border-emerald-200">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">₹{Math.round(parseFloat(selectedOrder.full_order.subtotal || selectedOrder.full_order.total_amount || 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-bold text-gray-800">Total Amount:</span>
                            <span className="text-lg font-bold text-emerald-600">
                              ₹{Math.round(parseFloat(selectedOrder.full_order.total_amount || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-semibold text-gray-700">Payment:</span> {selectedOrder.full_order.payment_method || "COD"}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Status:</span> {selectedOrder.full_order.status || "pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        setEditingOrder(selectedOrder);
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Edit Order
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleUpdateOrder} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Order</h2>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="text-gray-700 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={editingOrder.status}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Amount (₹)</label>
                    <input
                      type="number"
                      name="quote_amount"
                      step="0.01"
                      defaultValue={editingOrder.quote_amount || ""}
                      placeholder="Enter quote amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      name="admin_notes"
                      defaultValue={editingOrder.admin_notes || ""}
                      placeholder="Add admin notes..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Update Order"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

