"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGarage } from "@/app/dashboard/admin/cms-actions";

export function DeleteGarageButton({
  id,
  name,
}: {
  id: string;
  name: string;
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
          if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteGarage(id);
            if (!result.ok) {
              setError(result.error ?? "Could not delete garage. Please try again.");
            } else {
              setError(null);
            }
            router.refresh();
          });
        }}
        className="text-error font-semibold hover:underline disabled:opacity-50"
      >
        Delete
      </button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
