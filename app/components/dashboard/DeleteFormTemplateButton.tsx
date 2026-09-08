"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFormTemplate } from "@/app/dashboard/admin/forms/actions";

export function DeleteFormTemplateButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this form template?")) return;
        startTransition(async () => {
          try {
            await deleteFormTemplate(id);
            router.refresh();
          } catch {
            router.refresh();
          }
        });
      }}
      className="text-error font-semibold hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}