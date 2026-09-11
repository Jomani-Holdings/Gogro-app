"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncSeoRoutes } from "@/app/dashboard/admin/seo/actions";

export function SyncRoutesButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await syncSeoRoutes();
            router.refresh();
          } catch {
            router.refresh();
          }
        });
      }}
      className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-5 hover:bg-navy/90 disabled:opacity-60"
    >
      {pending ? "Syncing…" : "Sync Routes"}
    </button>
  );
}