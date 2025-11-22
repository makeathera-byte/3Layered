"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

interface Address {
  flat_number: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [colony, setColony] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setMobile(profile.mobile || "");
      if (profile.address) {
        setFlatNumber(profile.address.flat_number || "");
        setColony(profile.address.colony || "");
        setCity(profile.address.city || "");
        setState(profile.address.state || "");
        setPincode(profile.address.pincode || "");
      }
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Validation
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Name is required' });
        return;
      }

      if (mobile && !/^\d{10}$/.test(mobile)) {
        setMessage({ type: 'error', text: 'Mobile number must be 10 digits' });
        return;
      }

      if (pincode && !/^\d{6}$/.test(pincode)) {
        setMessage({ type: 'error', text: 'Pincode must be 6 digits' });
        return;
      }

      // Prepare address object
      const address: Address | null = flatNumber || colony || city || state || pincode
        ? { flat_number: flatNumber, colony, city, state, pincode }
        : null;

      // Update profile
      const { error } = await updateProfile({
        full_name: fullName,
        mobile: mobile || null,
        address: address,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current profile values
    if (profile) {
      setFullName(profile.full_name || "");
      setMobile(profile.mobile || "");
      if (profile.address) {
        setFlatNumber(profile.address.flat_number || "");
        setColony(profile.address.colony || "");
        setCity(profile.address.city || "");
        setState(profile.address.state || "");
        setPincode(profile.address.pincode || "");
      } else {
        setFlatNumber("");
        setColony("");
        setCity("");
        setState("");
        setPincode("");
      }
    }
    setIsEditing(false);
    setMessage(null);
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

  const formatAddress = (address: Address | null) => {
    if (!address) return "Not set";
    const parts = [];
    if (address.flat_number) parts.push(address.flat_number);
    if (address.colony) parts.push(address.colony);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    return parts.join(", ") || "Not set";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="max-w-3xl mx-auto mt-6 sm:mt-10 px-4 sm:px-0 mb-10">
      <div className="glass rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-moss">
              Account Details
            </h1>
            <p className="mt-2 text-sm text-moss">
              View and manage your account information
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-moss hover:text-emerald-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile.full_name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-moss">
              {profile.full_name || "User"}
            </h2>
            <p className="text-sm text-moss">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600' 
              : 'bg-red-500/10 border border-red-500/30 text-red-600'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Account Details Grid */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-moss">
              Account Information
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Name */}
              <div className="p-4 rounded-lg glass border border-white/20">
                <label className="block text-sm font-medium text-moss mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Mobile */}
              <div className="p-4 rounded-lg glass border border-white/20">
                <label className="block text-sm font-medium text-moss mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                  placeholder="10 digit mobile number"
                  maxLength={10}
                />
              </div>

              {/* Address Section */}
              <div className="p-4 rounded-lg glass border border-white/20 space-y-4">
                <h4 className="text-sm font-medium text-moss">Address</h4>
                
                <div>
                  <label className="block text-xs text-moss mb-1">Flat/Street Number</label>
                  <input
                    type="text"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                    placeholder="e.g., 123, ABC Apartments"
                  />
                </div>

                <div>
                  <label className="block text-xs text-moss mb-1">Colony/Area</label>
                  <input
                    type="text"
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                    placeholder="e.g., Green Park Colony"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-moss mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-moss mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-moss mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 text-gray-900"
                    placeholder="6 digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium transition-colors"
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-3">
              {/* User ID */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">User ID</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-mono text-moss break-all">{profile.id}</p>
                  <button
                    onClick={() => copyToClipboard(profile.id)}
                    className="ml-2 p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Email Address</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-moss">{profile.email}</p>
                  <button
                    onClick={() => copyToClipboard(profile.email)}
                    className="ml-2 p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Full Name</p>
                <p className="text-sm text-moss mt-1">{profile.full_name || "Not set"}</p>
              </div>

              {/* Mobile */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Mobile Number</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-moss">{profile.mobile || "Not set"}</p>
                  {profile.mobile && (
                    <button
                      onClick={() => copyToClipboard(profile.mobile!)}
                      className="ml-2 p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Address</p>
                <div className="flex items-start justify-between mt-1">
                  <p className="text-sm text-moss">{formatAddress(profile.address)}</p>
                  {profile.address && formatAddress(profile.address) !== "Not set" && (
                    <button
                      onClick={() => copyToClipboard(formatAddress(profile.address))}
                      className="ml-2 p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Type */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Account Type</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  profile.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                }`}>
                  {profile.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>

              {/* Member Since */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Member Since</p>
                <p className="text-sm text-moss mt-1">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Email Verified */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Email Verified</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  user.email_confirmed_at
                    ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                }`}>
                  {user.email_confirmed_at ? 'Yes' : 'No'}
                </span>
              </div>

              {/* Last Sign In */}
              <div className="p-4 rounded-lg glass border border-white/20 hover:border-emerald-400/30 transition-all">
                <p className="text-sm font-medium text-moss">Last Sign In</p>
                <p className="text-sm text-moss mt-1">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-moss">
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-4 rounded-lg glass border border-white/20 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-moss">
                    📊 My Dashboard
                  </p>
                  <p className="text-sm text-moss mt-1">
                    View orders & stats
                  </p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="p-4 rounded-lg glass border border-white/20 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-moss">
                    📦 My Orders
                  </p>
                  <p className="text-sm text-moss mt-1">
                    View order history
                  </p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="p-4 rounded-lg glass border border-white/20 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-moss">
                    🛒 Shopping Cart
                  </p>
                  <p className="text-sm text-moss mt-1">
                    View your cart
                  </p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              className="p-4 rounded-lg glass border border-red-500/30 dark:border-red-500/30 hover:bg-red-500/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    🚪 Sign Out
                  </p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                    Log out of your account
                  </p>
                </div>
                <span className="text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Account Security
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Your account is secured with Supabase authentication. Never share your password with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

