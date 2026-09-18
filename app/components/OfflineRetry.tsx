"use client";

export function OfflineRetry() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange text-white border border-transparent hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
    >
      Try Again
    </button>
  );
}
