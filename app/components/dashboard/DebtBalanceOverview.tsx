import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import type { TopDebtor } from "@/lib/data/types";

export function DebtBalanceOverview({
  debtors,
}: {
  debtors: TopDebtor[];
}) {
  return (
    <div className="bg-white border border-grey/40 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-navy mb-4">
        Debt Balance Overview
      </h2>

      {debtors.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-textdark/50 text-sm">
          No outstanding balances.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {debtors.map((debtor) => (
            <li
              key={debtor.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-grey/40 p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-textdark truncate">
                  {debtor.full_name ?? "Unknown"}
                </p>
                <p className="text-xs text-textdark/50 mt-0.5">
                  Balance: {formatMoney(debtor.driver_balance)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-lg font-bold text-textdark">
                  {formatMoney(debtor.total_balance)}
                </span>
                <Link
                  href={`/dashboard/admin/drivers/${debtor.id}`}
                  className="inline-block text-navy font-semibold text-sm hover:text-orange"
                >
                  View &rarr;
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}