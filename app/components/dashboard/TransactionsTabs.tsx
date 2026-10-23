"use client";

import { useState } from "react";
import type { AdminDeletedTransaction } from "@/lib/data/admin";
import {
  TransactionsTable,
  type AdminTransactionRow,
} from "@/app/components/dashboard/TransactionsTable";
import { DeletedTransactionsTable } from "@/app/components/dashboard/DeletedTransactionsTable";

type Tab = "active" | "deleted";

export function TransactionsTabs({
  transactions,
  deleted,
}: {
  transactions: AdminTransactionRow[];
  deleted: AdminDeletedTransaction[];
}) {
  const [tab, setTab] = useState<Tab>("active");

  return (
    <div>
      <div className="inline-flex rounded-full border border-grey/40 bg-white p-1 mb-6">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "active"
              ? "bg-navy text-white"
              : "text-textdark hover:bg-offwhite"
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setTab("deleted")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "deleted"
              ? "bg-navy text-white"
              : "text-textdark hover:bg-offwhite"
          }`}
        >
          Deleted
          {deleted.length > 0 ? (
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                tab === "deleted" ? "bg-white/20" : "bg-grey/40"
              }`}
            >
              {deleted.length}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "active" ? (
        <TransactionsTable transactions={transactions} />
      ) : (
        <DeletedTransactionsTable deleted={deleted} />
      )}
    </div>
  );
}
