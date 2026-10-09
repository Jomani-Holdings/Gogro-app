"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { reviewPaymentProof } from "@/app/dashboard/admin/payments/actions";
import type { AdminPaymentProof } from "@/lib/data/admin";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export function ReviewPaymentProofModal({
  proof,
  onClose,
}: {
  proof: AdminPaymentProof;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>(
    proof.fuel_balance > 0 ? proof.fuel_balance.toFixed(2) : ""
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isImage = /\.(png|jpe?g)$/i.test(proof.filename);
  const alreadyApproved = proof.status === "approved";

  function run(action: "approved" | "rejected" | "disputed") {
    setError(null);

    if (action === "approved") {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        setError("Enter an amount greater than zero.");
        return;
      }
    }
    if (action === "rejected" && !notes.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    startTransition(async () => {
      const result = await reviewPaymentProof({
        proofId: proof.id,
        action,
        amount: Number(amount),
        notes,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-grey/40 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-textdark">
              Review payment proof
            </h2>
            <p className="text-xs text-textdark/50">
              {proof.driver_name ?? "Unknown driver"}
              {proof.fuel_code ? ` · ${proof.fuel_code}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-textdark/50 hover:text-error"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <p className={labelClass}>Proof of payment</p>
            {proof.proof_url ? (
              isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proof.proof_url}
                  alt={proof.filename}
                  className="max-h-72 w-full rounded-lg border border-grey/40 object-contain bg-offwhite"
                />
              ) : (
                <a
                  href={proof.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
                >
                  Open {proof.filename}
                </a>
              )
            ) : (
              <p className="text-sm text-textdark/50">Proof unavailable.</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Verified amount (R)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={alreadyApproved}
                className={`${inputClass} disabled:bg-grey/10 disabled:text-textdark/40`}
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-textdark/50">
                Current fuel balance: R{proof.fuel_balance.toFixed(2)}
              </p>
              {alreadyApproved ? (
                <p className="mt-1 text-xs font-medium text-success">
                  Already approved — no new transaction will be logged.
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelClass}>Notes / reason</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-y`}
                placeholder="Required when rejecting or disputing."
              />
            </div>
          </div>

          {error ? <p className="text-sm text-error">{error}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-grey/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-grey/50 px-4 py-2.5 text-sm font-semibold text-textdark hover:border-navy"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("disputed")}
            className="rounded-lg border border-orange px-4 py-2.5 text-sm font-semibold text-orange hover:bg-orange/10 disabled:opacity-60"
          >
            Dispute
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("rejected")}
            className="rounded-lg border border-error px-4 py-2.5 text-sm font-semibold text-error hover:bg-error/10 disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={pending || alreadyApproved}
            onClick={() => run("approved")}
            className="rounded-lg bg-success px-5 py-2.5 text-sm font-semibold text-white hover:bg-success/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
