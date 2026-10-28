export function FuelUsageByGarageSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-grey/40 bg-white p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-6 w-48 rounded bg-grey/20" />
      <div className="mt-4 h-4 w-64 max-w-full rounded bg-grey/20" />
      <div className="mt-6 flex justify-center">
        <div className="h-40 w-40 rounded-full border-[18px] border-grey/20" />
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="h-4 w-32 rounded bg-grey/20" />
            <div className="h-4 w-16 rounded bg-grey/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
