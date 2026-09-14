"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { requestDocuments } from "@/app/dashboard/admin/documents/actions";
import { DOCUMENT_CATEGORIES } from "@/lib/data/types";

export function RequestDocumentsModal({
  leadId,
  userId,
  existingCategories,
}: {
  leadId: string;
  userId: string;
  existingCategories: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(existingCategories)
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(value: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await requestDocuments(
        leadId,
        userId,
        Array.from(selected)
      );
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-5 hover:bg-navy/5"
      >
        Request Documents
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-grey/40">
              <h2 className="text-lg font-bold text-textdark">
                Request Documents
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded-md text-textdark/60 hover:bg-grey/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {error ? (
                <p className="mb-4 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}
              <p className="text-sm text-textdark/70 mb-4">
                Select the documents you need from this driver. A pending
                request will appear on their dashboard.
              </p>
              <div className="flex flex-col gap-2">
                {DOCUMENT_CATEGORIES.map((category) => {
                  const checked = selected.has(category.value);
                  return (
                    <label
                      key={category.value}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                        checked
                          ? "border-navy bg-navy/5"
                          : "border-grey/40 hover:border-navy/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(category.value)}
                        className="mt-1 h-5 w-5 rounded border-grey text-navy focus:ring-navy/60"
                      />
                      <div>
                        <p className="font-semibold text-textdark">
                          {category.label}
                        </p>
                        <p className="text-sm text-textdark/60">
                          {category.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-grey/40">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-grey/60 text-textdark font-semibold py-2.5 px-5 hover:bg-grey/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending || selected.size === 0}
                onClick={submit}
                className="rounded-lg bg-orange text-white font-semibold py-2.5 px-5 hover:bg-orange/90 disabled:opacity-60"
              >
                {pending ? "Requesting…" : "Send request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}