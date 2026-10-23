"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetStreak } from "@/app/dashboard/admin/drivers/actions";

export function ResetStreakButton({
  driverId,
  streak,
}: {
  driverId: string;
  streak: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              `Reset this driver's ${streak}-week on-time streak to 0?`
            )
          ) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await resetStreak(driverId);
            if (!result.ok) {
              setError(result.error ?? "Could not reset the streak.");
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex items-center justify-center rounded-lg border border-error/50 text-error font-semibold py-2.5 px-4 hover:bg-error/10 disabled:opacity-50"
      >
        Reset streak
      </button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
