"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative min-h-[60vh] bg-navy text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
      <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
        <p className="text-orange font-bold uppercase tracking-widest text-sm mb-4">
          Something went wrong
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Unexpected Error
        </h1>
        <p className="text-lg text-offwhite max-w-xl mx-auto mb-8 font-light">
          We hit a snag while loading this page. Try again, or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange text-white border border-transparent hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-white/10 text-white border border-white/40 hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}