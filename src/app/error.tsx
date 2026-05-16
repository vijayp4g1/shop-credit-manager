"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/50 p-8 shadow-sm">
        <div className="w-16 h-16 bg-error-container mx-auto rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px] text-on-error-container">error</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Something went wrong</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
