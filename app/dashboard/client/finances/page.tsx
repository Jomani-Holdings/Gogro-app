import { requireClient } from "@/lib/auth";
import {
  getClientTransactions,
  getClientBalances,
} from "@/lib/data/client";
import { formatDateTime, formatBalance } from "@/lib/utils";
import { TRANSACTION_LABELS } from "@/lib/data/types";
import { SignedAmount } from "@/app/components/dashboard/SignedAmount";

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

export default async function ClientLedgerPage() {
  const profile = await requireClient();
  const [transactions, balances] = await Promise.all([
    getClientTransactions(profile.user_id),
    getClientBalances(profile.user_id),
  ]);

  const currentBalance = formatBalance(balances?.driver_balance ?? 0);

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
              {currentBalance.isCredit ? "Account Credit" : "Current Balance"}
            </p>
            <p
              className={`text-3xl font-bold mt-1 ${
                currentBalance.isCredit ? "text-success" : "text-textdark"
              }`}
            >
              {currentBalance.text}
            </p>
            {currentBalance.isCredit ? (
              <p className="text-xs text-success mt-1">
                Available to spend
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { key: "fuel", label: "Fuel", amount: balances?.fuel_balance ?? 0 },
            { key: "repair", label: "Repair", amount: balances?.repair_balance ?? 0 },
            { key: "rental", label: "Rental", amount: balances?.rental_balance ?? 0 },
            {
              key: "penalties",
              label: "Penalties & Adjustments",
              amount: balances?.penalty_balance ?? 0,
            },
          ].map((bucket) => {
            const balance = formatBalance(bucket.amount);
            return (
              <div
                key={bucket.key}
                className="rounded-xl border border-grey/40 bg-offwhite px-4 py-3"
              >
                <p className="text-xs font-medium text-textdark/50">
                  {balance.isCredit ? `${bucket.label} Credit` : bucket.label}
                </p>
                <p
                  className={`text-lg font-semibold mt-0.5 ${
                    balance.isCredit ? "text-success" : "text-textdark"
                  }`}
                >
                  {balance.text}
                </p>
                {balance.isCredit ? (
                  <p className="text-xs text-success mt-0.5">
                    Available credit
                  </p>
                ) : null}
              </div>
            );
          })}
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
                    <td className="px-4 py-3 text-right">
                      <SignedAmount type={tx.type} amount={tx.amount} />
                      {tx.points_earned > 0 ? (
                        <span className="block text-xs font-semibold text-success">
                          +{tx.points_earned} pts
                        </span>
                      ) : null}
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