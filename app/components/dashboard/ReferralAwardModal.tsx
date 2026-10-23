"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { awardReferralPoints } from "@/app/dashboard/admin/drivers/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export function ReferralAwardModal({
  referralId,
  driverName,
}: {
  referralId: string;
  driverName: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function openModal() {
    setPoints("");
    setError(null);
    setSuccess(false);
    setOpen(true);
  }

  function submit() {
    setError(null);
    const value = Number(points);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Enter a whole number of points greater than zero.");
      return;
    }

    startTransition(async () => {
      const result = await awardReferralPoints(referralId, value);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 800);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-navy font-semibold hover:text-orange"
      >
        Award points
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!pending) setOpen(false);
            }}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-grey/40">
              <h2 className="text-lg font-bold text-textdark">
                Award referral points
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                disabled={pending}
                className="p-1 rounded-md text-textdark/60 hover:bg-grey/20 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error ? (
                <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}
              {success ? (
                <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Points awarded.
                </div>
              ) : null}

              <p className="text-sm text-textdark/70">
                Award points to the referrer for{" "}
                <span className="font-semibold text-textdark">
                  {driverName ?? "this referral"}
                </span>
                .
              </p>

              <div>
                <label htmlFor="referral_points" className={labelClass}>
                  Points
                </label>
                <input
                  id="referral_points"
                  type="number"
                  min={1}
                  step={1}
                  value={points}
                  onChange={(event) => setPoints(event.target.value)}
                  className={inputClass}
                  placeholder="e.g. 300"
                  autoFocus
                  disabled={pending || success}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-grey/40">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg border border-grey/60 text-textdark font-semibold py-2.5 px-5 hover:bg-grey/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || success || !points}
                className="rounded-lg bg-orange text-white font-semibold py-2.5 px-5 hover:bg-orange/90 disabled:opacity-60"
              >
                {pending ? "Awarding…" : "Award points"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
