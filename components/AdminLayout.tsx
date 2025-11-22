"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAdminAuthenticated, getAdminSession, clearAdminSession } from "@/lib/adminAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Verify authentication on mount and periodically
    const checkAuth = () => {
      if (!isAdminAuthenticated()) {
        clearAdminSession();
        router.push("/admin.3layered.06082008/login");
        return;
      }
      setIsAuthenticated(true);
      setCheckingAuth(false);
    };

    checkAuth();

    // Check authentication every 30 seconds
    const authInterval = setInterval(checkAuth, 30000);

    // Check on window focus
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(authInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin.3layered.06082008/login");
  };

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-800">Verifying authentication...</div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin.3layered.06082008/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin.3layered.06082008/products", label: "Products", icon: "📦" },
    { href: "/admin.3layered.06082008/orders", label: "Orders", icon: "🛒" },
    { href: "/admin.3layered.06082008/custom-print", label: "Custom Prints", icon: "🖨️" },
    { href: "/admin.3layered.06082008/customized-orders", label: "Customized Orders", icon: "✨" },
    { href: "/admin.3layered.06082008/reviews", label: "Reviews", icon: "⭐" },
    { href: "/admin.3layered.06082008/users", label: "Users", icon: "👥" },
    { href: "/admin.3layered.06082008/media", label: "Media", icon: "🖼️" },
    { href: "/admin.3layered.06082008/media/upload", label: "Upload Media", icon: "📤" },
    { href: "/admin.3layered.06082008/pages", label: "Pages", icon: "📄" },
    { href: "/admin.3layered.06082008/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white border border-gray-200 p-2 rounded-lg hover:bg-gray-100 hover:shadow-lg transition-all shadow-md"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/admin.3layered.06082008/dashboard" className="block">
              <div className="glass logo-premium rounded-2xl px-3 py-2 mb-2">
                <Image
                  src="/logo.png"
                  alt="3Layered - Admin Panel"
                  width={160}
                  height={43}
                  priority
                  className="select-none drop-shadow"
                />
              </div>
              <div className="text-center">
                <h2 className="text-sm font-bold text-gray-800">Admin Panel</h2>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md border border-emerald-500/50"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 transition-all"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

