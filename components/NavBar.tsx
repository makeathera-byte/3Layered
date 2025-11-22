"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { UserProfileButton } from "./UserProfileButton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "./ErrorBoundary";

export function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const totalItems = getTotalItems();

  const linkClass = (href: string) =>
    clsx(
      "px-3 py-2 rounded-md text-sm font-medium transition-all",
      "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      "border border-emerald-400/40 hover:border-emerald-400/60",
      "backdrop-blur-sm",
      "hover:from-emerald-500/30 hover:to-green-500/30",
      "shadow-sm hover:shadow-md hover:shadow-emerald-500/20",
      pathname === href ? "text-moss shadow-glow bg-emerald-500/30" : "text-moss"
    );

  const pillClass = (href: string) =>
    clsx(
      "px-3 py-2 rounded-full text-sm font-medium transition-all",
      "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      "border border-emerald-400/40 hover:border-emerald-400/60",
      "backdrop-blur-sm",
      "hover:from-emerald-500/30 hover:to-green-500/30",
      "shadow-sm hover:shadow-md hover:shadow-emerald-500/20",
      pathname === href ? "text-moss shadow-glow bg-emerald-500/30" : "text-moss"
    );

  const mobileLinkClass = (href: string) =>
    clsx(
      "block px-4 py-3 rounded-md text-base font-medium transition-all",
      "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      "border border-emerald-400/40 hover:border-emerald-400/60",
      "backdrop-blur-sm",
      "hover:from-emerald-500/30 hover:to-green-500/30",
      "shadow-sm hover:shadow-md hover:shadow-emerald-500/20",
      pathname === href ? "text-moss shadow-glow bg-emerald-500/30" : "text-moss"
    );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Left: Logo and Mobile Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center">
              <div className="glass logo-premium rounded-2xl sm:rounded-3xl px-2 sm:px-3 py-0.5 sm:py-1.5 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="3Layered - 3D Printing Store"
                  width={120}
                  height={32}
                  priority
                  className="select-none drop-shadow sm:hidden"
                />
              <Image
                src="/logo.png"
                alt="3Layered - 3D Printing Store"
                  width={200}
                  height={54}
                priority
                  className="select-none drop-shadow hidden sm:block"
              />
            </div>
          </Link>
            
            {/* Mobile Menu Button - Right after logo */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 hover:border-emerald-400/60 backdrop-blur-sm hover:from-emerald-500/30 hover:to-green-500/30 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 p-1.5 sm:p-2 rounded-md transition-all"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-2 items-center flex-shrink-0">
            <Link href="/" className={linkClass("/")}>Home</Link>
            <Link href="/products" className={linkClass("/products")}>Products</Link>
            <Link href="/custom-print" className={linkClass("/custom-print")}>Custom Print</Link>
            <Link href="/about" className={linkClass("/about")}>About</Link>
            <Link href="/cart" className={clsx(linkClass("/cart"), "relative", pathname === "/cart" ? "bg-emerald-500/30" : "")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Show Login/Signup if not logged in, otherwise show User Profile */}
            {!user ? (
              <>
                <Link href="/login" className={pillClass("/login")}>Login</Link>
                <Link href="/signup" className={pillClass("/signup")}>Sign Up</Link>
              </>
            ) : (
              <ErrorBoundary fallback={<span className="text-xs text-moss">Account</span>}>
                <UserProfileButton />
              </ErrorBoundary>
            )}
          </nav>

          {/* Mobile: Cart and User Profile */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <Link href="/cart" className={clsx("bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 hover:border-emerald-400/60 backdrop-blur-sm hover:from-emerald-500/30 hover:to-green-500/30 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 p-2 rounded-md transition-all relative", pathname === "/cart" ? "shadow-glow bg-emerald-500/30" : "")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            {user && (
              <ErrorBoundary fallback={<span className="text-xs text-moss">Account</span>}>
                <UserProfileButton inline={true} />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-2">
            <Link href="/" className={mobileLinkClass("/")} onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" className={mobileLinkClass("/products")} onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="/custom-print" className={mobileLinkClass("/custom-print")} onClick={() => setMobileMenuOpen(false)}>
              Custom Print
            </Link>
            <Link href="/about" className={mobileLinkClass("/about")} onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/cart" className={clsx(mobileLinkClass("/cart"), "flex items-center justify-between")} onClick={() => setMobileMenuOpen(false)}>
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="bg-emerald-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Show Login/Signup only if not logged in */}
            {!user && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <Link href="/login" className={mobileLinkClass("/login")} onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/signup" className={mobileLinkClass("/signup")} onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
