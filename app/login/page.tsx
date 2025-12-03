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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                aria-describedby={error ? "password-error" : undefined}
                aria-invalid={error ? "true" : "false"}
                className="w-full rounded-lg glass border border-emerald-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 pr-12 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-moss dark:text-slate-400 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L12 12m-5.71-5.71L12 12m0 0l3.29 3.29M12 12l3.29-3.29m0 0L12 12m3.29 3.29L3 3" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
