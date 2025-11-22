"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin.3layered.06082008/login");
  }, [router]);

  return null;
}

