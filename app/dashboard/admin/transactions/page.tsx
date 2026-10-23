import {
  getAdminTransactions,
  getAdminDeletedTransactions,
} from "@/lib/data/admin";
import { TransactionsTabs } from "@/app/components/dashboard/TransactionsTabs";

export default async function AdminTransactionsPage() {
  const [transactions, deleted] = await Promise.all([
    getAdminTransactions(200),
    getAdminDeletedTransactions(200),
  ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Transactions
      </h1>
      <p className="text-textdark/60 mt-1">
        The full ledger — fuel purchases, repayments, rentals and corrections.
      </p>

      <div className="mt-8">
        <TransactionsTabs transactions={transactions} deleted={deleted} />
      </div>
    </div>
  );
}
