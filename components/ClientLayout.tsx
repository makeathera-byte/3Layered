"use client";

import { CartProvider } from "@/contexts/CartContext";
import { NavBar } from "@/components/NavBar";
import { GlobalLighting } from "@/components/GlobalLighting";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="grid-faint"></div>
      <GlobalLighting />
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </CartProvider>
  );
}

