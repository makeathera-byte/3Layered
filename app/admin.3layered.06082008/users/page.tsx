"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminUsersAPI } from "@/lib/admin-api";

interface Address {
  flat_number?: string;
  colony?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  mobile: string | null;
  address: Address | null;
  role: string;
  created_at: string;
  email_verified: boolean;
  last_sign_in?: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadUsers();
    }
  }, [router, mounted]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUsersAPI.getAll();
      console.log("Users data:", data); // Debug log
      setUsers(data.users || []);
      if (!data.users || data.users.length === 0) {
        console.warn("No users found in database");
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
      alert(`Failed to load users: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      await adminUsersAPI.updateRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const formatAddress = (address: Address | null) => {
    if (!address) return "N/A";
    const parts = [];
    if (address.flat_number) parts.push(address.flat_number);
    if (address.colony) parts.push(address.colony);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    return parts.join(", ") || "N/A";
  };

  if (!mounted || !isAuthorized) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-800">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  const CopyButton = ({ text, fieldId }: { text: string; fieldId: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldId)}
      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
      title="Copy to clipboard"
    >
      {copiedField === fieldId ? (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-800 mt-2">Manage platform users - {users.length} total</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="animate-pulse p-8">
              <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-800 text-lg">No users yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const fullAddress = formatAddress(user.address);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div className="ml-3 flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {user.full_name || "N/A"}
                              </span>
                              {user.full_name && (
                                <CopyButton text={user.full_name} fieldId={`name-${user.id}`} />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 break-all max-w-xs">
                              {user.email}
                            </span>
                            <CopyButton text={user.email} fieldId={`email-${user.id}`} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">
                              {user.mobile || "N/A"}
                            </span>
                            {user.mobile && (
                              <CopyButton text={user.mobile} fieldId={`phone-${user.id}`} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="text-sm text-gray-900 max-w-xs break-words">
                              {fullAddress}
                            </div>
                            {user.address && fullAddress !== "N/A" && (
                              <CopyButton text={fullAddress} fieldId={`address-${user.id}`} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role || "customer"}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={updatingId === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-300"
                                : "bg-gray-50 text-gray-700 border-gray-300"
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {user.email_verified ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Unverified
                              </span>
                            )}
                            {user.last_sign_in && (
                              <span className="text-xs text-gray-700">
                                Last: {new Date(user.last_sign_in).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
