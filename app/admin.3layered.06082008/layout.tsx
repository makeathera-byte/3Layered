"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/adminAuth";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't protect the login page
    if (pathname?.includes("/login")) {
      return;
    }

    // Check authentication for all other admin routes
    if (!isAdminAuthenticated()) {
      clearAdminSession();
      router.push("/admin.3layered.06082008/login");
    }
  }, [pathname, router]);

  // If on login page, allow access
  if (pathname?.includes("/login")) {
    return <>{children}</>;
  }

  // For protected routes, check auth before rendering
  if (!isAdminAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-800">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}

