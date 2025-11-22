import "./globals.css";
import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "3Layered - 3D Printing Store",
  description: "Your trusted 3D printing store offering high-quality prints, custom designs, action figures, sculptures, and more. We print your ideas to life!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen relative">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
