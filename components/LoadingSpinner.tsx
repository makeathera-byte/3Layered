// Loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-moss border-t-transparent dark:border-slate-300 dark:border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-800 dark:text-white font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="w-full h-48 bg-slate-300 dark:bg-slate-700 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}

