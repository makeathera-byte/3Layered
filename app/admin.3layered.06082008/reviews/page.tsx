"use client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { adminReviewsAPI } from "@/lib/admin-api";

export default function AdminReviews() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/login");
    } else {
      setIsAuthorized(true);
      loadReviews();
    }
  }, [router, mounted]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminReviewsAPI.getAll();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string, approved: boolean) => {
    try {
      setActioningId(reviewId);
      await adminReviewsAPI.approve(reviewId, approved);
      await loadReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setActioningId(reviewId);
      await adminReviewsAPI.delete(reviewId);
      await loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setActioningId(null);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reviews</h1>
          <p className="text-gray-800 mt-2">Manage customer reviews</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <p className="text-gray-800 text-lg">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.products?.title || "Product"}
                    </h3>
                    <p className="text-sm text-gray-800">
                      by {review.users?.full_name || review.users?.email || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-700">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.is_verified_purchase && (
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✓ Verified
                      </span>
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      review.is_approved
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200"
                    }`}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-800 mb-4">{review.comment}</p>
                )}

                {review.admin_response && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                    <p className="text-gray-800 text-sm">{review.admin_response}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      disabled={actioningId === review.id}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors border border-emerald-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      disabled={actioningId === review.id}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition-colors border border-orange-200 disabled:opacity-50"
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={actioningId === review.id}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors border border-red-200 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
