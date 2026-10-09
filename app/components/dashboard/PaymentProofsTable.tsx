"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDateTime, formatMoney } from "@/lib/utils";
import type { AdminPaymentProof } from "@/lib/data/admin";
import { PaginationControls } from "@/app/components/dashboard/PaginationControls";
import { ReviewPaymentProofModal } from "@/app/components/dashboard/ReviewPaymentProofModal";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-3 py-2 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";

const STATUSES = ["all", "pending", "approved", "rejected", "disputed"] as const;

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/30 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
  disputed: "bg-orange/15 text-orange",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  disputed: "Disputed",
};

const CATEGORY_LABELS: Record<string, string> = {
  fuel_repayment: "Fuel Repayment",
  repair_repayment: "Repair Repayment",
  rental_repayment: "Rental Repayment",
};

export function PaymentProofsTable({
  rows,
  page,
  pageSize,
  pageCount,
  total,
  filters,
  rangeAll,
}: {
  rows: AdminPaymentProof[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  filters: {
    status: string;
    category: string;
    q: string;
    from: string;
    to: string;
  };
  rangeAll: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(filters.q);
  const [from, setFrom] = useState(filters.from);
  const [to, setTo] = useState(filters.to);
  const [category, setCategory] = useState(filters.category);
  const [active, setActive] = useState<AdminPaymentProof | null>(null);

  function hrefWith(updates: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    return `${pathname}?${params.toString()}`;
  }

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    router.push(hrefWith({ q, from, to, category, range: null, page: 1 }));
  }

  return (
    <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-grey/40 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((status) => (
            <Link
              key={status}
              href={hrefWith({ status, page: 1 })}
              className={
                filters.status === status
                  ? "rounded-full border border-navy bg-navy px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-grey/40 px-3 py-1.5 text-xs font-semibold text-textdark hover:border-navy"
              }
            >
              {status === "all" ? "All" : statusLabels[status]}
            </Link>
          ))}

          <span className="mx-1 h-5 w-px bg-grey/40" />

          <Link
            href={hrefWith({ range: null, from: null, to: null, page: 1 })}
            className={
              !rangeAll
                ? "rounded-full border border-navy bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy"
                : "rounded-full border border-grey/40 px-3 py-1.5 text-xs font-semibold text-textdark hover:border-navy"
            }
          >
            Last 30 days
          </Link>
          <Link
            href={hrefWith({ range: "all", from: null, to: null, page: 1 })}
            className={
              rangeAll
                ? "rounded-full border border-navy bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy"
                : "rounded-full border border-grey/40 px-3 py-1.5 text-xs font-semibold text-textdark hover:border-navy"
            }
          >
            All time
          </Link>
        </div>

        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search driver or fuel code"
            className={inputClass}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className={inputClass}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-textdark/60">
          {filters.status === "pending"
            ? "No pending payment proofs."
            : "No payment proofs found."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-offwhite text-textdark/60">
              <tr>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Driver</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">
                  Fuel code
                </th>
                <th className="text-right font-medium px-4 py-3 hidden lg:table-cell">
                  Balance
                </th>
                <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">
                  Category
                </th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Proof</th>
                <th className="text-right font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey/30">
              {rows.map((proof) => (
                <tr key={proof.id} className="hover:bg-offwhite/60">
                  <td className="px-4 py-3 text-textdark/70">
                    {formatDateTime(proof.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-textdark">
                    {proof.driver_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-textdark/70 hidden md:table-cell">
                    {proof.fuel_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-textdark hidden lg:table-cell">
                    {formatMoney(proof.fuel_balance, 2)}
                  </td>
                  <td className="px-4 py-3 text-textdark/70 hidden lg:table-cell">
                    {CATEGORY_LABELS[proof.category] ?? proof.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusStyles[proof.status] ?? statusStyles.pending
                      }`}
                    >
                      {statusLabels[proof.status] ?? proof.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {proof.proof_url ? (
                      <a
                        href={proof.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-navy hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-textdark/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(proof)}
                      className="rounded-lg border border-navy px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        currentPage={page}
        pageCount={pageCount}
        total={total}
        pageSize={pageSize}
        buildHref={(target) => hrefWith({ page: target })}
      />

      {active ? (
        <ReviewPaymentProofModal proof={active} onClose={() => setActive(null)} />
      ) : null}
    </div>
  );
}
