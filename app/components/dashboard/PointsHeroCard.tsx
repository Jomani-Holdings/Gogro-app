"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { formatPoints, pointsToRand } from "@/lib/utils";

export function PointsHeroCard({ points }: { points: number }) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy text-white p-6 flex flex-col justify-between min-h-[230px]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm text-white/70">Your Rewards Balance</p>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-orange shrink-0">
          <Gift size={20} />
        </span>
      </div>

      <div className="relative mt-4">
        <p className="text-4xl font-bold leading-tight">
          {formatPoints(points)}
        </p>
        <p className="text-sm text-white/60 mt-1">
          Worth approx. R{pointsToRand(points)}
        </p>
      </div>

      <div className="relative mt-5">
        <button
          type="button"
          onClick={() => setToast(true)}
          className="inline-flex w-full items-center justify-center rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-textdark transition-colors hover:bg-yellow/90"
        >
          Redeem Rewards &rarr;
        </button>
        {toast ? (
          <p className="mt-2 text-center text-xs text-white/80">
            Rewards store coming soon.
          </p>
        ) : null}
      </div>
    </section>
  );
}
