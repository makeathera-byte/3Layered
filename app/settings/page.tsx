"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    
    if (profile) {
      setFullName(profile.full_name || "");
      setMobile(profile.mobile || "");
    }
  }, [user, profile, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await updateProfile({
        full_name: fullName,
        mobile: mobile,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <section className="max-w-2xl mx-auto mt-10 px-4">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-moss">Loading...</p>
        </div>
      </section>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <section className="max-w-2xl mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-moss">
            Settings
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-moss hover:text-emerald-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Profile Settings */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-moss mb-4">
              Profile Settings
            </h2>
            
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg glass border border-white/20 px-4 py-3 text-sm sm:text-base text-moss bg-slate-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-moss">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-lg glass border border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-lg glass border border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={profile.id}
                  disabled
                  className="w-full rounded-lg glass border border-white/20 px-4 py-3 text-xs sm:text-sm text-moss bg-slate-100 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  Account Type
                </label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  }`}>
                    {profile.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-moss mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  disabled
                  className="w-full rounded-lg glass border border-white/20 px-4 py-3 text-sm sm:text-base text-moss bg-slate-100 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-400 disabled:to-emerald-500 text-white rounded-lg px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className="pt-6 border-t border-white/20 dark:border-white/10">
            <h2 className="text-xl font-semibold text-moss mb-4">
              Account Actions
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push("/account")}
                className="w-full glass border border-white/20 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-lg px-4 py-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-moss">
                      View Account Details
                    </p>
                    <p className="text-sm text-moss">
                      See your complete account information
                    </p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>

              <button
                onClick={() => router.push("/orders")}
                className="w-full glass border border-white/20 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-lg px-4 py-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-moss">
                      My Orders
                    </p>
                    <p className="text-sm text-moss">
                      View your order history
                    </p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

