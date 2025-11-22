"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/input-sanitizer";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [colony, setColony] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [info, setInfo] = useState("");
  
  // Show info message if redirected from checkout
  useEffect(() => {
    if (returnUrl) {
      setInfo("Please create an account to proceed to checkout.");
    }
  }, [returnUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate all required fields are filled
    if (!name.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!mobile.trim()) {
      setError("Mobile number is required");
      setLoading(false);
      return;
    }

    // Validate mobile number format (basic validation)
    if (mobile.trim().length < 10) {
      setError("Please enter a valid mobile number (minimum 10 digits)");
      setLoading(false);
      return;
    }

    // Validate address fields
    if (!flatNumber.trim()) {
      setError("Flat/Street number is required");
      setLoading(false);
      return;
    }

    if (!colony.trim()) {
      setError("Colony/Area is required");
      setLoading(false);
      return;
    }

    if (!city.trim()) {
      setError("City is required");
      setLoading(false);
      return;
    }

    if (!state.trim()) {
      setError("State is required");
      setLoading(false);
      return;
    }

    if (!pincode.trim()) {
      setError("Pincode is required");
      setLoading(false);
      return;
    }

    // Validate pincode format (basic validation - 6 digits)
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Sanitize all inputs before sending
      const sanitizedName = sanitizeString(name, 100);
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedMobile = sanitizePhone(mobile);
      const sanitizedFlatNumber = sanitizeString(flatNumber, 50);
      const sanitizedColony = sanitizeString(colony, 100);
      const sanitizedCity = sanitizeString(city, 50);
      const sanitizedState = sanitizeString(state, 50);
      const sanitizedPincode = pincode.trim().slice(0, 6);

      // Prepare address object with sanitized data
      const address = {
        flat_number: sanitizedFlatNumber,
        colony: sanitizedColony,
        city: sanitizedCity,
        state: sanitizedState,
        pincode: sanitizedPincode
      };

      const { error: signUpError } = await signUp(sanitizedEmail, password, sanitizedName, sanitizedMobile, address);
      
      if (signUpError) {
        // Check if user already exists
        const errorMessage = signUpError.message.toLowerCase();
        if (
          errorMessage.includes('already') || 
          errorMessage.includes('registered') ||
          errorMessage.includes('exists')
        ) {
          // User already exists, redirect to login
          setError("This email is already registered. Redirecting to login...");
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}&message=account_exists`);
          }, 2000);
          return;
        }
        
        setError(signUpError.message || "Failed to create account");
        return;
      }

      // Show email verification modal
      setShowEmailModal(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowEmailModal(false);
    // If there's a return URL, pass it to login page
    if (returnUrl) {
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      router.push("/login");
    }
  };
  return (
    <section className="max-w-md mx-auto mt-6 sm:mt-10 px-4 sm:px-0">
      <div className="glass rounded-2xl p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-moss">
          Sign Up
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
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div>
            <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
              className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
              placeholder="Enter your full name"
          />
        </div>
          
        <div>
            <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
              className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
              placeholder="Enter your email"
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            minLength={10}
            pattern="[0-9+\-\s()]*"
              className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
              placeholder="Enter your mobile number (e.g., +919982781000)"
          />
        </div>

        {/* Address Section */}
        <div className="pt-4 border-t border-white/20">
          <h3 className="text-base sm:text-lg font-semibold text-moss dark:text-slate-300 mb-3">
            Address Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
                Flat/Street Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                required
                className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                placeholder="Enter flat/house/street number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
                Colony/Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={colony}
                onChange={(e) => setColony(e.target.value)}
                required
                className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                placeholder="Enter colony or area name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                maxLength={6}
                pattern="\d{6}"
                className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                placeholder="Enter 6-digit pincode"
              />
            </div>
          </div>
        </div>
          
        <div>
            <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
              className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
              placeholder="Create a password (min 6 characters)"
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-moss dark:text-slate-300 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
              className="w-full rounded-lg glass border border-white/20 dark:border-white/10 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/50 px-4 py-3 text-sm sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
              placeholder="Confirm your password"
          />
        </div>
          
        <button
          type="submit"
          disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500/30 to-green-500/30 hover:from-emerald-500/40 hover:to-green-500/40 border border-emerald-400/50 hover:border-emerald-400/70 backdrop-blur-sm text-moss rounded-lg px-4 py-3 font-semibold shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
        
        <p className="mt-6 text-sm text-center text-moss dark:text-slate-400">
          Already have an account? <Link href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login"} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Login</Link>
      </p>
      </div>

      {/* Email Verification Modal */}
      {showEmailModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleModalClose}
          >
            {/* Modal */}
            <div 
              className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-500/30 animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-3">
                Check Your Email!
              </h2>

              {/* Message */}
              <p className="text-center text-moss dark:text-slate-300 mb-2">
                We've sent a verification link to:
              </p>
              <p className="text-center font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                {email}
              </p>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  📧 Next Steps:
                </p>
                <ol className="text-sm text-blue-600/80 dark:text-blue-400/80 space-y-1 list-decimal list-inside">
                  <li>Open your email inbox</li>
                  <li>Find the verification email from 3 Layered</li>
                  <li>Click the verification link</li>
                  <li>Return here to log in</li>
                </ol>
              </div>

              {/* Note */}
              <p className="text-xs text-center text-moss dark:text-slate-400 mb-6">
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </p>

              {/* Action Button */}
              <button
                onClick={handleModalClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </section>
  );
}
