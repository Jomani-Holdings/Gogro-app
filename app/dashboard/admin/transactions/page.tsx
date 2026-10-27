import {
  getAdminTransactions,
  getAdminDeletedTransactions,
} from "@/lib/data/admin";
import { TransactionsTabs } from "@/app/components/dashboard/TransactionsTabs";
import { TransactionsTable } from "@/app/components/dashboard/TransactionsTable";
import { DeletedTransactionsTable } from "@/app/components/dashboard/DeletedTransactionsTable";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "deleted" ? "deleted" : "active";
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const direction = params.dir === "prev" ? "prev" : "next";
  const query = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  const activePage =
    tab === "active"
      ? await getAdminTransactions({ cursor, direction, query, type, from, to })
      : null;

  const deletedPage =
    tab === "deleted"
      ? await getAdminDeletedTransactions({ cursor, direction, query })
      : null;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Transactions
      </h1>
      <p className="text-textdark/60 mt-1">
        The full ledger — fuel purchases, repayments, rentals and corrections.
      </p>

      <div className="mt-8">
        <TransactionsTabs tab={tab} />
        <div className="mt-6">
          {activePage ? (
            <TransactionsTable
              transactions={activePage.rows}
              pageInfo={activePage}
              filters={{ query, type, from, to }}
            />
          ) : null}
          {deletedPage ? (
            <DeletedTransactionsTable
              deleted={deletedPage.rows}
              pageInfo={deletedPage}
              query={query}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
