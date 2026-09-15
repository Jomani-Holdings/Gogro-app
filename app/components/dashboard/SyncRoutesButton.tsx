"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncSeoRoutes } from "@/app/dashboard/admin/seo/actions";

export function SyncRoutesButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await syncSeoRoutes();
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Could not sync routes. Please try again."
              );
              router.refresh();
            }
          });
        }}
        className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-5 hover:bg-navy/90 disabled:opacity-60"
      >
        {pending ? "Syncing…" : "Sync Routes"}
      </button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}