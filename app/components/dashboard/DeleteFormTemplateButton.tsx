"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFormTemplate } from "@/app/dashboard/admin/forms/actions";

export function DeleteFormTemplateButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this form template?")) return;
          setError(null);
          startTransition(async () => {
            try {
              await deleteFormTemplate(id);
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Could not delete form template. Please try again."
              );
              router.refresh();
            }
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