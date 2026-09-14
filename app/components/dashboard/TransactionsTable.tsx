"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";
import type { Transaction } from "@/lib/data/types";

export type AdminTransactionRow = Transaction & { driver_name: string | null };

const typeFilters = ["all", ...Object.keys(TRANSACTION_LABELS)] as const;

const typeStyles: Record<string, string> = {
  fuel_issue: "bg-orange/10 text-orange",
  repair_issue: "bg-yellow/20 text-textdark",
  fuel_repayment: "bg-success/10 text-success",
  repair_repayment: "bg-success/10 text-success",
  rental_fee: "bg-navy/10 text-navy",
  opening_balance: "bg-grey/40 text-textdark",
  balance_correction_increase: "bg-blue-600/10 text-blue-600",
  balance_correction_decrease: "bg-error/10 text-error",
};

export function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransactionRow[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (!q) return true;
      return [
        tx.driver_name,
        tx.vehicle_name,
        tx.garage_name,
        tx.driver_id,
      ].some((value) => value?.toLowerCase().includes(q));
    });
  }, [transactions, filter, query]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-textdark border-grey/40 hover:border-navy"
              }`}
            >
              {value === "all" ? "All" : TRANSACTION_LABELS[value as keyof typeof TRANSACTION_LABELS]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search driver, vehicle, garage…"
          className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
        />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No transactions match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Type
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Vehicle
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Garage
                  </th>
                  <th className="px-4 py-3 font-medium">Litres</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                  >
                    <td className="px-4 py-3 text-textdark/70">
                      {formatDateTime(tx.created_at)}
                    </td>
                    <td className="px-4 py-3 text-textdark">
                      {tx.driver_name ? (
                        <Link
                          href={`/dashboard/admin/drivers/${tx.driver_id}`}
                          className="font-medium text-navy hover:text-orange"
                        >
                          {tx.driver_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          typeStyles[tx.type] ?? "bg-grey/40 text-textdark"
                        }`}
                      >
                        {TRANSACTION_LABELS[tx.type] ?? tx.type}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/70">
                      {tx.vehicle_name ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/70">
                      {tx.garage_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-textdark/70">
                      {tx.litres !== null ? `${tx.litres} L` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-textdark">
                      {formatMoney(tx.amount, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}