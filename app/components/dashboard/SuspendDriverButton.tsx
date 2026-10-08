"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDriverActivation } from "@/app/dashboard/admin/actions";

export function SuspendDriverButton({
  profileId,
  driverStatus,
}: {
  profileId: string;
  driverStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shouldReactivate =
    driverStatus === "inactive" || driverStatus === "suspended";

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setDriverActivation(profileId, !shouldReactivate);
        if (!result.ok) {
          setError(result.error ?? "Something went wrong.");
          return;
        }
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={
          shouldReactivate
            ? "inline-flex items-center justify-center rounded-lg bg-success text-white font-semibold py-2.5 px-4 hover:bg-success/90 disabled:opacity-60"
            : "inline-flex items-center justify-center rounded-lg border border-error text-error font-semibold py-2.5 px-4 hover:bg-error/10 disabled:opacity-60"
        }
      >
        {pending
          ? "Saving…"
          : shouldReactivate
            ? "Reactivate"
            : "Suspend"}
      </button>
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : null}
    </div>
  );
}