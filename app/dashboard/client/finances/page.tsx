import { requireClient } from "@/lib/auth";
import {
  getClientTransactions,
  getClientBalances,
} from "@/lib/data/client";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";

const typeStyles: Record<string, string> = {
  fuel_issue: "bg-orange/10 text-orange",
  repair_issue: "bg-yellow/20 text-textdark",
  fuel_repayment: "bg-success/10 text-success",
  repair_repayment: "bg-success/10 text-success",
  rental_fee: "bg-navy/10 text-navy",
  rental_repayment: "bg-success/10 text-success",
  penalty_fee: "bg-error/10 text-error",
  opening_balance: "bg-grey/40 text-textdark",
  balance_correction_increase: "bg-blue-600/10 text-blue-600",
  balance_correction_decrease: "bg-error/10 text-error",
};

export default async function ClientLedgerPage() {
  const profile = await requireClient();
  const [transactions, balances] = await Promise.all([
    getClientTransactions(profile.user_id),
    getClientBalances(profile.user_id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            My Finances
          </h1>
          <p className="text-textdark/60 mt-1">
            Your full transaction history across fuel, repairs, rentals and more.
          </p>
        </div>
      </div>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-textdark/50">
              Current Balance
            </p>
            <p className="text-3xl font-bold text-textdark mt-1">
              {formatMoney(balances?.driver_balance ?? 0, 2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Fuel", amount: balances?.fuel_balance ?? 0 },
            { label: "Repair", amount: balances?.repair_balance ?? 0 },
            { label: "Rental", amount: balances?.rental_balance ?? 0 },
            {
              label: "Penalties & Adjustments",
              amount: balances?.penalty_balance ?? 0,
            },
          ].map((bucket) => (
            <div
              key={bucket.label}
              className="rounded-xl border border-grey/40 bg-offwhite px-4 py-3"
            >
              <p className="text-xs font-medium text-textdark/50">
                {bucket.label}
              </p>
              <p className="text-lg font-semibold text-textdark mt-0.5">
                {formatMoney(bucket.amount, 2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-6">
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
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
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                  >
                    <td className="px-4 py-3 text-textdark/70">
                      {formatDateTime(tx.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          typeStyles[tx.type] ?? "bg-grey/40 text-textdark"
                        }`}
                      >
                        {TRANSACTION_LABELS[tx.type] ?? tx.type}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-textdark/70">
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