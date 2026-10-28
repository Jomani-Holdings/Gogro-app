"use client";

import { useEffect } from "react";
import Link from "next/link";

export function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-grey/40 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-textdark">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-textdark/60">
          We couldn&apos;t load this part of your dashboard. Try again, or head
          back to the overview.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-textdark/40">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
