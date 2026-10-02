import { formatMoney } from "@/lib/utils";

export type DebtBucket = {
  key: string;
  label: string;
  amount: number;
};

export function DebtBreakdown({
  buckets,
  total,
  title = "Account Summary",
  totalLabel = "Total Balance Owed",
}: {
  buckets: DebtBucket[];
  total: number;
  title?: string;
  totalLabel?: string;
}) {
  const max = Math.max(...buckets.map((b) => Math.max(b.amount, 0)), 0, 1);

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <p className="text-sm text-textdark/70">
          {totalLabel}:{" "}
          <span className="font-bold text-textdark">
            {formatMoney(total, 2)}
          </span>
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {buckets.map((bucket) => (
          <div key={bucket.key}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-textdark">{bucket.label}</span>
              <span
                className={`font-semibold ${
                  bucket.amount > 0 ? "text-error" : "text-textdark"
                }`}
              >
                {formatMoney(bucket.amount, 2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-grey/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange"
                style={{ width: `${Math.max(bucket.amount, 0) / max * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}