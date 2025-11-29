"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminCustomPrintAPI } from "@/lib/admin-api";
import { formatDateLocale, formatTimeLocale, formatDateTimeLocale } from "@/lib/dateUtils";

// Contact support number
const CONTACT_SUPPORT_NUMBER = "+919982781000";

interface CustomPrintOrder {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  description: string | null;
  drive_link: string | null;
  status: string;
  quote_amount: number | null;
  quote_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminCustomPrintOrders() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomPrintOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomPrintOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<CustomPrintOrder | null>(null);
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
      const data = await adminCustomPrintAPI.getAll(status);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error("Error loading custom print orders:", error);
      alert(`Failed to load orders: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      await adminCustomPrintAPI.update(orderId, { status: newStatus });
      await loadOrders();
      setEditingOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Failed to update order: ${error.message || "Unknown error"}`);
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
      await adminCustomPrintAPI.update(editingOrder.id, {
        status: formData.get("status") as string,
        quote_amount: formData.get("quote_amount") ? parseFloat(formData.get("quote_amount") as string) : undefined,
        quote_notes: formData.get("quote_notes") as string || undefined,
        admin_notes: formData.get("admin_notes") as string || undefined,
      });
      await loadOrders();
      setEditingOrder(null);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Failed to update order: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(orderId);
      await adminCustomPrintAPI.delete(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error("Error deleting order:", error);
      alert(`Failed to delete order: ${error.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "quoted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "approved":
        return "bg-green-100 text-green-900 border-green-200";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Custom Print Orders</h1>
            <p className="text-gray-800 mt-1">Manage custom print requests from customers</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${CONTACT_SUPPORT_NUMBER.replace(/\s/g, '')}`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {CONTACT_SUPPORT_NUMBER}
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="quoted">Quoted</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="ml-auto text-sm text-gray-800">
              Total: <span className="font-semibold">{orders.length}</span> orders
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <div className="text-gray-800">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <div className="text-gray-800">No custom print orders found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {order.user_name || "Guest User"}
                    </h3>
                    <p className="text-sm text-gray-800">{order.user_email}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.file_name && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">File: </span>
                      <span className="text-sm text-gray-800">{order.file_name}</span>
                      {order.file_size && (
                        <span className="text-xs text-gray-700 ml-2">({formatFileSize(order.file_size)})</span>
                      )}
                    </div>
                  )}
                  {order.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Description: </span>
                      <p className="text-sm text-gray-800 mt-1 line-clamp-2">{order.description}</p>
                    </div>
                  )}
                  {order.drive_link && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Drive Link: </span>
                      <a
                        href={order.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                      >
                        Open Link
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                  {order.quote_amount && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Quote: </span>
                      <span className="text-sm text-emerald-600 font-semibold">₹{Math.round(order.quote_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Submitted: </span>
                    <span className="text-sm text-gray-800">
                      {mounted ? (
                        `${formatDateLocale(order.created_at)} ${formatTimeLocale(order.created_at)}`
                      ) : (
                        <span className="text-transparent">Loading...</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setEditingOrder(order);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                  >
                    View & Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    disabled={deletingId === order.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === order.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Order</h2>
                  <button
                    onClick={() => {
                      setEditingOrder(null);
                      setSelectedOrder(null);
                    }}
                    className="text-gray-700 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingOrder.status}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="quoted">Quoted</option>
                      <option value="approved">Approved</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote Amount (₹)</label>
                    <input
                      type="number"
                      name="quote_amount"
                      step="0.01"
                      defaultValue={editingOrder.quote_amount || ""}
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote Notes (for customer)</label>
                    <textarea
                      name="quote_notes"
                      rows={3}
                      defaultValue={editingOrder.quote_notes || ""}
                      placeholder="Notes to share with the customer..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (internal)</label>
                    <textarea
                      name="admin_notes"
                      rows={3}
                      defaultValue={editingOrder.admin_notes || ""}
                      placeholder="Internal notes (not visible to customer)..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Order Details</h3>
                    <div className="space-y-1 text-sm text-gray-800">
                      <p><strong>Customer:</strong> {editingOrder.user_name || "Guest"} ({editingOrder.user_email})</p>
                      {editingOrder.file_name && (
                        <p><strong>File:</strong> {editingOrder.file_name} {editingOrder.file_size && `(${formatFileSize(editingOrder.file_size)})`}</p>
                      )}
                      {editingOrder.description && <p><strong>Description:</strong> {editingOrder.description}</p>}
                      {editingOrder.drive_link && (
                        <p>
                          <strong>Drive Link:</strong>{" "}
                          <a
                            href={editingOrder.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                          >
                            View Files
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </p>
                      )}
                      <p><strong>Submitted:</strong> {mounted ? formatDateTimeLocale(editingOrder.created_at) : 'Loading...'}</p>
                    </div>
                    {editingOrder.file_url && (
                      <div className="mt-3">
                        <a
                          href={editingOrder.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          Download File
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Update Order"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOrder(null);
                        setSelectedOrder(null);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

