"use client";

import { useState, type FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";
import type { Transaction } from "@/lib/data/types";
import { deleteTransaction } from "@/app/dashboard/admin/transactions/actions";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";
import { SignedAmount } from "@/app/components/dashboard/SignedAmount";

export type AdminTransactionRow = Transaction & { driver_name: string | null };

const typeFilters = ["all", ...Object.keys(TRANSACTION_LABELS)] as const;

const typeStyles: Record<string, string> = {
  fuel_issue: "bg-orange/10 text-orange",
  repair_issue: "bg-yellow/20 text-textdark",
  fuel_repayment: "bg-success/10 text-success",
  repair_repayment: "bg-success/10 text-success",
  reward_credit: "bg-success/10 text-success",
  rental_fee: "bg-navy/10 text-navy",
  rental_repayment: "bg-success/10 text-success",
  penalty_fee: "bg-error/10 text-error",
  opening_balance: "bg-grey/40 text-textdark",
  balance_correction_increase: "bg-blue-600/10 text-blue-600",
  balance_correction_decrease: "bg-error/10 text-error",
};

export function TransactionsTable({
  transactions,
  pageInfo,
  filters,
}: {
  transactions: AdminTransactionRow[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  filters: { query: string; type: string; from: string; to: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query);

  const [pending, setPending] = useState<AdminTransactionRow | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("cursor");
    params.delete("dir");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: FormEvent) {
    e.preventDefault();
    navigate({ q: query.trim() || null });
  }

  function openDelete(tx: AdminTransactionRow) {
    setPending(tx);
    setWarning(null);
    setError(null);
  }

  function closeModal() {
    if (submitting) return;
    setPending(null);
    setWarning(null);
    setError(null);
  }

  async function handleDelete() {
    if (!pending) return;
    setSubmitting(true);
    setError(null);

    const result = await deleteTransaction(pending.id, warning !== null);

    if (result.ok) {
      setSubmitting(false);
      setPending(null);
      setWarning(null);
      router.refresh();
      return;
    }

    if (result.requiresConfirmation && result.warning) {
      setWarning(result.warning);
      setSubmitting(false);
      return;
    }

    setError(result.error ?? "Something went wrong.");
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                navigate({ type: value === "all" ? null : value })
              }
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters.type === value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-textdark border-grey/40 hover:border-navy"
              }`}
            >
              {value === "all"
                ? "All"
                : TRANSACTION_LABELS[
                    value as keyof typeof TRANSACTION_LABELS
                  ]}
            </button>
          ))}
        </div>
        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search driver name, email or phone…"
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
        {transactions.length === 0 ? (
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
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
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
                    <td className="px-4 py-3 text-right">
                      <SignedAmount type={tx.type} amount={tx.amount} />
                      {tx.points_earned > 0 ? (
                        <span className="block text-xs font-semibold text-success">
                          +{tx.points_earned} pts
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDelete(tx)}
                        className="rounded-lg border border-error/60 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/10"
                      >
                        Delete
                      </button>
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
          rowCount={transactions.length}
        />
      </div>

      {pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-textdark">
              Delete transaction?
            </h3>
            <p className="text-sm text-textdark/70 mt-2">
              This moves the transaction to the Deleted tab and reverses its
              balance impact on the driver&apos;s account. You can restore it
              later.
            </p>

            <div className="mt-4 rounded-xl bg-offwhite px-4 py-3 text-sm">
              <p className="font-medium text-textdark">
                {pending.driver_name ?? "Driver"}
              </p>
              <p className="text-textdark/60">
                {TRANSACTION_LABELS[pending.type] ?? pending.type} ·{" "}
                <SignedAmount type={pending.type} amount={pending.amount} /> ·{" "}
                {formatDateTime(pending.created_at)}
              </p>
            </div>

            {warning ? (
              <div className="mt-4 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {warning}
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm text-error">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg border border-navy px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-60"
              >
                {submitting
                  ? "Deleting…"
                  : warning
                    ? "Delete anyway"
                    : "Delete transaction"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
