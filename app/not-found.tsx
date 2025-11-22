import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-blue-300 mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

