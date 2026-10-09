"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Landmark, TriangleAlert } from "lucide-react";
import { formatMoney } from "@/lib/utils";

const BANK = {
  name: "Capitec Business Bank",
  accountName: "JOMANI HOLDINGS",
  accountNumber: "1051602009",
  branchCode: "450105",
};

const PROOF_MESSAGE =
  "Hi, please find attached my payment for my fuel account.";

function CopyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable — the value is still visible to copy manually.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-medium text-textdark/50">{label}</p>
        <p className="text-sm font-semibold text-textdark truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-grey/50 text-textdark/60 hover:text-navy hover:border-navy transition-colors"
      >
        {copied ? (
          <Check size={16} className="text-success" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}

export function BankingDetailsTile({
  fullName,
  fuelCode,
  outstandingBalance,
}: {
  fullName: string | null;
  fuelCode: string | null;
  outstandingBalance: number;
}) {
  const reference = [fullName?.trim(), fuelCode?.trim()]
    .filter(Boolean)
    .join(" ") || "Add your name and fuel code";

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-navy">
        <Landmark size={22} />
        <h2 className="text-lg font-semibold">Banking Details</h2>
      </div>

      <div className="mt-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-error/70">
            Outstanding Fuel Balance
          </p>
          <p className="text-2xl font-bold text-error">
            {formatMoney(outstandingBalance, 2)}
          </p>
        </div>
        <p className="text-xs text-textdark/60 max-w-[16rem] text-right">
          Please pay this amount in full so you can refuel.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <CopyValue label="Bank" value={BANK.name} />
        <CopyValue label="Account Name" value={BANK.accountName} />
        <CopyValue label="Account Number" value={BANK.accountNumber} />
        <CopyValue label="Branch Code" value={BANK.branchCode} />
      </div>

      <div className="mt-3">
        <CopyValue label="Reference" value={reference} />
        <p className="mt-1 text-xs text-textdark/50">
          Use your full name and fuel code as the payment reference.
        </p>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-textdark/70">
        <li className="flex gap-2">
          <span className="text-orange">•</span>
          EFT and ATM cash deposits only — no payments are accepted at partner
          garages.
        </li>
        <li className="flex gap-2">
          <span className="text-orange">•</span>
          Payments are due every Tuesday by 12:00 midday.
        </li>
        <li className="flex gap-2">
          <span className="text-orange">•</span>
          ATM cash deposits must include an extra R20 to cover bank deposit
          fees.
        </li>
      </ul>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-yellow/50 bg-yellow/20 px-4 py-3">
        <TriangleAlert size={18} className="text-orange shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-textdark">
          All payment must be in before you are able to refuel.
        </p>
      </div>

      <Link
        href={`/dashboard/client/support?category=fuel-repayment&message=${encodeURIComponent(
          PROOF_MESSAGE
        )}#support-form`}
        replace
        className="mt-5 w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90"
      >
        Submit proof of payment
      </Link>
    </section>
  );
}
