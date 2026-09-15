"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle } from "@/app/dashboard/admin/vehicles/actions";

export function DeleteVehicleButton({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await deleteVehicle(vehicleId);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/dashboard/admin/vehicles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-textdark/70">Are you sure?</span>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-error text-white font-semibold py-2.5 px-5 transition-colors hover:bg-error/90 disabled:opacity-60"
        >
          {submitting ? "Deleting…" : "Yes, delete vehicle"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-2.5 px-5 transition-colors hover:bg-navy/5 disabled:opacity-60"
        >
          Cancel
        </button>
        {error ? (
          <p className="w-full text-sm text-error">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center justify-center rounded-lg border border-error text-error font-semibold py-2.5 px-5 transition-colors hover:bg-error/10"
    >
      Delete vehicle
    </button>
  );
}