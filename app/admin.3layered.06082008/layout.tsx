"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/adminAuth";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Wait for client-side mount
    
    // Don't protect the login page
    if (pathname?.includes("/login")) {
      return;
    }

    // Check authentication for all other admin routes
    if (!isAdminAuthenticated()) {
      clearAdminSession();
      router.push("/admin.3layered.06082008/login");
    }
  }, [pathname, router, mounted]);

  // During SSR or before mount, show loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-800">Loading...</div>
      </div>
    );
  }

  // If on login page, allow access
  if (pathname?.includes("/login")) {
    return <>{children}</>;
  }

  // For protected routes, check auth before rendering (only on client)
  if (!isAdminAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-800">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}

