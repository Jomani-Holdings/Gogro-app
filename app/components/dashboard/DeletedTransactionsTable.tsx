"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";
import type { AdminDeletedTransaction } from "@/lib/data/admin";
import { restoreTransaction } from "@/app/dashboard/admin/transactions/actions";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";

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

export function DeletedTransactionsTable({
  deleted,
  pageInfo,
  query,
}: {
  deleted: AdminDeletedTransaction[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  query: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const [pending, setPending] = useState<AdminDeletedTransaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applySearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const term = search.trim();
    if (term) params.set("q", term);
    else params.delete("q");
    params.set("tab", "deleted");
    params.delete("cursor");
    params.delete("dir");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleRestore() {
    if (!pending) return;
    setSubmitting(true);
    setError(null);

    const result = await restoreTransaction(pending.transaction.id);

    if (result.ok) {
      setSubmitting(false);
      setPending(null);
      router.refresh();
      return;
    }

    setError(result.error ?? "Something went wrong.");
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <p className="text-sm text-textdark/60">
          Deleted transactions are hidden from the driver&apos;s account.
          Restore one to put it back in the active ledger.
        </p>
        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver name…"
            className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {deleted.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No deleted transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Deleted</th>
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
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Deleted by
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deleted.map((item) => {
                  const tx = item.transaction;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                    >
                      <td className="px-4 py-3 text-textdark/70">
                        {formatDateTime(item.deleted_at)}
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
                      <td className="px-4 py-3 text-right font-semibold text-textdark">
                        {formatMoney(tx.amount, 2)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-textdark/70">
                        {item.deleted_by_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setPending(item);
                            setError(null);
                          }}
                          className="rounded-lg border border-navy/60 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <CursorPagination
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
          nextCursor={pageInfo.nextCursor}
          prevCursor={pageInfo.prevCursor}
          rowCount={deleted.length}
        />
      </div>

      {pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-textdark">
              Restore transaction?
            </h3>
            <p className="text-sm text-textdark/70 mt-2">
              This puts the transaction back in the active ledger and re-applies
              its balance impact on the driver&apos;s account.
            </p>

            <div className="mt-4 rounded-xl bg-offwhite px-4 py-3 text-sm">
              <p className="font-medium text-textdark">
                {pending.transaction.driver_name ?? "Driver"}
              </p>
              <p className="text-textdark/60">
                {TRANSACTION_LABELS[pending.transaction.type] ??
                  pending.transaction.type}{" "}
                · {formatMoney(pending.transaction.amount, 2)} ·{" "}
                {formatDateTime(pending.transaction.created_at)}
              </p>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-error">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!submitting) setPending(null);
                }}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg border border-navy px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
              >
                {submitting ? "Restoring…" : "Restore transaction"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
