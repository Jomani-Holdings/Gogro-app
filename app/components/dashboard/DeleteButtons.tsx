"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/app/dashboard/admin/cms-actions";

export function DeleteServiceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this service?")) return;
        startTransition(async () => {
          try {
            await deleteService(id);
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
