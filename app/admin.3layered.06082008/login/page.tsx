"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAdminSession, isAdminAuthenticated } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    if (isAdminAuthenticated()) {
      router.push("/admin.3layered.06082008/dashboard");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call the login API
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid admin credentials");
        localStorage.removeItem("admin:auth");
        return;
      }

      if (data.success && data.session) {
        // Store session in localStorage
        localStorage.setItem("admin:auth", JSON.stringify(data.session));
        
        // Small delay to ensure session is saved
        setTimeout(() => {
          router.push("/admin.3layered.06082008/dashboard");
        }, 100);
      } else {
        setError("Invalid admin credentials");
        localStorage.removeItem("admin:auth");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      localStorage.removeItem("admin:auth");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-800">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 max-w-md w-full border border-gray-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 glass logo-premium rounded-2xl px-4 py-2 inline-block">
            <Image
              src="/logo.png"
              alt="3Layered - Admin Panel"
              width={180}
              height={48}
              priority
              className="select-none drop-shadow"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-800">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-3 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 transition-all"
              placeholder="Enter your admin email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 px-4 py-3 pr-12 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 transition-all"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-400 disabled:to-emerald-500 text-white rounded-lg px-4 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-800 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

