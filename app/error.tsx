"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">⚠️</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Something went wrong!</h2>
          <p className="text-blue-300 mb-4">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

