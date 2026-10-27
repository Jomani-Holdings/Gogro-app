import Link from "next/link";

export function TransactionsTabs({ tab }: { tab: "active" | "deleted" }) {
  return (
    <div className="inline-flex rounded-full border border-grey/40 bg-white p-1">
      <Link
        href="/dashboard/admin/transactions"
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
          tab === "active"
            ? "bg-navy text-white"
            : "text-textdark hover:bg-offwhite"
        }`}
      >
        Active
      </Link>
      <Link
        href="/dashboard/admin/transactions?tab=deleted"
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
          tab === "deleted"
            ? "bg-navy text-white"
            : "text-textdark hover:bg-offwhite"
        }`}
      >
        Deleted
      </Link>
    </div>
  );
}
