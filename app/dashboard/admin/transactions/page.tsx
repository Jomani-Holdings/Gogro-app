import { getAdminTransactions } from "@/lib/data/admin";
import { TransactionsTable } from "@/app/components/dashboard/TransactionsTable";

export default async function AdminTransactionsPage() {
  const transactions = await getAdminTransactions(200);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Transactions
      </h1>
      <p className="text-textdark/60 mt-1">
        The full ledger — fuel issues, repayments, rentals and corrections.
      </p>

      <div className="mt-8">
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}