// Error message component
export function ErrorMessage({
  error,
  onRetry,
  className = ''
}: {
  error: any;
  onRetry?: () => void;
  className?: string;
}) {
  const message = typeof error === 'string' ? error : error?.message || 'An error occurred';

  return (
    <div className={`glass rounded-2xl p-6 border-2 border-red-500/20 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
            Error
          </h3>
          <p className="text-slate-700 dark:text-slate-300">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  actionLabel
}: {
  title: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-800 dark:text-slate-400 mb-6">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-6 py-3 bg-moss dark:bg-slate-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

