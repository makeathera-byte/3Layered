"use client";

import Link from "next/link";
import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Check for query parameters on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const messageParam = searchParams.get('message');
    const returnUrlParam = searchParams.get('returnUrl');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (messageParam === 'account_exists') {
      setInfo("This email is already registered. Please log in with your existing account.");
    }
    
    if (returnUrlParam) {
      setInfo("Please log in to continue to checkout.");
    }
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo(""); // Clear info message on submit

    try {
      const { error: signInError } = await signIn(email.trim(), password);
      
      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Use startTransition for navigation to avoid blocking UI
      const returnUrl = searchParams.get('returnUrl');
      startTransition(() => {
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push("/");
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      setLoading(false);
    }
  };
  const isLoading = loading || isPending;

  return (
    <section className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <div className="glass rounded-2xl p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-moss">
          Login
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {info && (
            <div 
              role="alert"
              aria-live="polite"
              className="bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg px-4 py-3 text-sm"
            >
              {info}
            </div>
          )}

          {error && (
            <div 
              role="alert"
              aria-live="assertive"
              className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium text-moss mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              aria-describedby={error ? "email-error" : undefined}
              aria-invalid={error ? "true" : "false"}
              className="w-full rounded-lg glass border border-emerald-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
            
          <div>
            <label 
              htmlFor="password"
              className="block text-sm font-medium text-moss mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              aria-describedby={error ? "password-error" : undefined}
              aria-invalid={error ? "true" : "false"}
              className="w-full rounded-lg glass border border-emerald-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
          </div>
            
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500/30 to-green-500/30 hover:from-emerald-500/40 hover:to-green-500/40 border border-emerald-400/50 hover:border-emerald-400/70 backdrop-blur-sm text-moss rounded-lg px-4 py-3 font-semibold shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
          
        <p className="mt-6 text-sm text-center text-moss">
          Don&apos;t have an account?{" "}
          <Link 
            href="/signup" 
            className="text-emerald-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
          >
            Sign Up
          </Link>
        </p>
      </div>
      <Footer />
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <section className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
        <div className="glass rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    }>
      <LoginForm />
    </Suspense>
  );
}
