"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";
import type { AdminTransaction } from "@/lib/data/admin";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";
import { SignedAmount } from "@/app/components/dashboard/SignedAmount";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-3 py-2 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";

const REPAYMENT_TYPES = [
  "fuel_repayment",
  "repair_repayment",
  "rental_repayment",
] as const;

export function RepaymentHistoryTable({
  rows,
  pageInfo,
  filters,
  rangeAll,
}: {
  rows: AdminTransaction[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  filters: { type: string; q: string; from: string; to: string };
  rangeAll: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(filters.q);
  const [from, setFrom] = useState(filters.from);
  const [to, setTo] = useState(filters.to);
  const [type, setType] = useState(filters.type);

  function hrefWith(updates: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    params.delete("cursor");
    params.delete("dir");
    return `${pathname}?${params.toString()}`;
  }

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    router.push(hrefWith({ q, from, to, type, range: null }));
  }

  return (
    <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
        <Link
          href={hrefWith({ range: null, from: null, to: null })}
          className={
            !rangeAll
              ? "rounded-full border border-navy bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy"
              : "rounded-full border border-grey/40 px-3 py-1.5 text-xs font-semibold text-textdark hover:border-navy"
          }
        >
          Last 30 days
        </Link>
        <Link
          href={hrefWith({ range: "all", from: null, to: null })}
          className={
            rangeAll
              ? "rounded-full border border-navy bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy"
              : "rounded-full border border-grey/40 px-3 py-1.5 text-xs font-semibold text-textdark hover:border-navy"
          }
        >
          All time
        </Link>
      </div>
      <form
        onSubmit={applyFilters}
        className="grid gap-3 md:grid-cols-4 p-4 border-b border-grey/40"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search driver"
          className={inputClass}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="all">All repayments</option>
          {REPAYMENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {TRANSACTION_LABELS[value]}
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

      {rows.length === 0 ? (
        <div className="p-10 text-center text-textdark/60">
          No repayments found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-offwhite text-textdark/60">
              <tr>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Driver</th>
                <th className="text-left font-medium px-4 py-3">Type</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey/30">
              {rows.map((tx) => (
                <tr key={tx.id} className="hover:bg-offwhite/60">
                  <td className="px-4 py-3 text-textdark/70">
                    {formatDateTime(tx.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-textdark">
                    {tx.driver_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-textdark/70">
                    {TRANSACTION_LABELS[tx.type] ?? tx.type}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SignedAmount type={tx.type} amount={tx.amount} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CursorPagination
        hasNextPage={pageInfo.hasNextPage}
        hasPreviousPage={pageInfo.hasPreviousPage}
        nextCursor={pageInfo.nextCursor}
        prevCursor={pageInfo.prevCursor}
        rowCount={rows.length}
      />
    </div>
  );
}
