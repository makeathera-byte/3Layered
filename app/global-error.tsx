"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <div className="text-center px-4">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">⚠️</h1>
              <h2 className="text-3xl font-bold text-white mb-2">Something went wrong!</h2>
              <p className="text-blue-300 mb-4">
                {error.message || "A global error occurred"}
              </p>
            </div>
            
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

