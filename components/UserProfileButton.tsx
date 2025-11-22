"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type UserProfileButtonProps = {
  inline?: boolean;
};

export function UserProfileButton({ inline = false }: UserProfileButtonProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debug logging
  console.log('UserProfileButton - user:', user ? 'exists' : 'null');
  console.log('UserProfileButton - profile:', profile ? 'exists' : 'null');

  // If no user is logged in, return null or a login button
  if (!user || !profile) {
    console.log('UserProfileButton - returning null (no user or profile)');
    return null;
  }

  const userPhoto = profile.photo_url;
  const userName = profile.full_name || profile.email.split('@')[0];
  
  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    router.push("/");
  };

  // Inline mode: show user info directly without dropdown button
  if (inline) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-3">
          {userPhoto ? (
            <Image
              src={userPhoto}
              alt={userName || "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {userName}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-400">
              {profile.email}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Link
            href="/account"
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-colors"
          >
            My Account
          </Link>
          <Link
            href="/orders"
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-colors"
          >
            My Orders
          </Link>
          <Link
            href="/settings"
            className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-colors"
          >
            Settings
          </Link>
          <div className="border-t border-white/10 dark:border-white/5 pt-2 mt-2">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default mode: button with dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="glass rounded-full pl-1 pr-3 py-1 hover:shadow-glow transition-all flex items-center gap-2"
        aria-label="User settings"
      >
        {userPhoto ? (
          <Image
            src={userPhoto}
            alt={userName || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-slate-800 dark:text-white leading-tight">
            {userName}
          </span>
          <span className="text-xs text-slate-700 dark:text-slate-400 leading-tight">
            {profile.role === 'admin' ? '👑 Admin' : 'Account'}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-slate-800 dark:text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-72 glass rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-white/10 z-50">
            {/* User Header with Avatar and Info */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 dark:border-white/5">
              {userPhoto ? (
                <Image
                  src={userPhoto}
                  alt={userName || "User"}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-emerald-500/30">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-400 truncate">
                  {profile.email}
                </p>
                {profile.mobile && (
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
                    📱 {profile.mobile}
                  </p>
                )}
                {profile.role === 'admin' && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    👑 Admin
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 hover:border-emerald-500/20 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                My Dashboard
              </Link>
              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 hover:border-emerald-500/20 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 hover:border-emerald-500/20 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-blue-500/10 hover:border-emerald-500/20 border border-transparent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              
              {profile.role === 'admin' && (
                <Link
                  href="/admin.3layered.06082008/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}

              {/* Sign Out */}
              <div className="border-t border-white/10 dark:border-white/5 pt-2 mt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

