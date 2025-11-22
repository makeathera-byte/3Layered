"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
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

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (messageParam === 'account_exists') {
      setInfo("This email is already registered. Please log in with your existing account.");
    }
    
    if (returnUrl) {
      setInfo("Please log in to continue to checkout.");
    }
  }, [searchParams, returnUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo(""); // Clear info message on submit

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        return;
      }

      // Redirect to return URL if exists, otherwise home page
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <div className="glass rounded-2xl p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-moss">
          Login
        </h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {info && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg px-4 py-3 text-sm">
            {info}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
            <label className="block text-sm font-medium text-moss mb-2">
              Email
            </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
              className="w-full rounded-lg glass border border-emerald-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all"
              placeholder="Enter your email"
          />
        </div>
          
        <div>
            <label className="block text-sm font-medium text-moss mb-2">
              Password
            </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
              className="w-full rounded-lg glass border border-emerald-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-moss placeholder:text-slate-400 transition-all"
              placeholder="Enter your password"
          />
        </div>
          
        <button
          type="submit"
          disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500/30 to-green-500/30 hover:from-emerald-500/40 hover:to-green-500/40 border border-emerald-400/50 hover:border-emerald-400/70 backdrop-blur-sm text-moss rounded-lg px-4 py-3 font-semibold shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
        
        <p className="mt-6 text-sm text-center text-moss">
          Don&apos;t have an account? <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">Sign Up</Link>
      </p>
      </div>
      <Footer />
    </section>
  );
}
