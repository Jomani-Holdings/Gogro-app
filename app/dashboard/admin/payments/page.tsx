import Link from "next/link";
import {
  getAdminPaymentProofs,
  getAdminRepaymentTransactions,
} from "@/lib/data/admin";
import { PaymentProofsTable } from "@/app/components/dashboard/PaymentProofsTable";
import { RepaymentHistoryTable } from "@/app/components/dashboard/RepaymentHistoryTable";

function defaultRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const tab = params.tab === "history" ? "history" : "proofs";
  const rangeAll = params.range === "all";
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const fallback = defaultRange();
  const rawFrom = typeof params.from === "string" ? params.from : "";
  const rawTo = typeof params.to === "string" ? params.to : "";
  const from = rangeAll ? "" : rawFrom || fallback.from;
  const to = rangeAll ? "" : rawTo || fallback.to;

  const status = typeof params.status === "string" ? params.status : "pending";
  const category =
    typeof params.category === "string" ? params.category : "all";
  const type = typeof params.type === "string" ? params.type : "all";

  const proofs =
    tab === "proofs"
      ? await getAdminPaymentProofs({
          status,
          category,
          query: q,
          from,
          to,
          page,
        })
      : null;

  const history =
    tab === "history"
      ? await getAdminRepaymentTransactions({ type, query: q, from, to, page })
      : null;

  const tableKey = [tab, status, category, type, q, from, to, page].join("|");

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Payments</h1>
      <p className="text-textdark/60 mt-1">
        Review proof of payment and track incoming repayments.
      </p>

      <div className="mt-6 flex gap-2 border-b border-grey/40">
        <Link
          href="/dashboard/admin/payments"
          className={
            tab === "proofs"
              ? "px-4 py-2.5 text-sm font-semibold text-navy border-b-2 border-navy -mb-px"
              : "px-4 py-2.5 text-sm font-semibold text-textdark/60 hover:text-navy"
          }
        >
          Payment Proofs
        </Link>
        <Link
          href="/dashboard/admin/payments?tab=history"
          className={
            tab === "history"
              ? "px-4 py-2.5 text-sm font-semibold text-navy border-b-2 border-navy -mb-px"
              : "px-4 py-2.5 text-sm font-semibold text-textdark/60 hover:text-navy"
          }
        >
          Repayment History
        </Link>
      </div>

      <div className="mt-5">
        {tab === "proofs" && proofs ? (
          <PaymentProofsTable
            key={tableKey}
            rows={proofs.rows}
            page={proofs.page}
            pageSize={proofs.pageSize}
            pageCount={proofs.pageCount}
            total={proofs.total}
            filters={{ status, category, q, from, to }}
            rangeAll={rangeAll}
          />
        ) : null}

        {tab === "history" && history ? (
          <RepaymentHistoryTable
            key={tableKey}
            rows={history.rows}
            page={history.page}
            pageSize={history.pageSize}
            pageCount={history.pageCount}
            total={history.total}
            filters={{ type, q, from, to }}
            rangeAll={rangeAll}
          />
        ) : null}
      </div>
    </div>
  );
}
