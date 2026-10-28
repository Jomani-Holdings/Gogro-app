export function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="h-8 w-56 rounded-lg bg-grey/30" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-grey/20" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl border border-grey/30 bg-white p-4"
          >
            <div className="h-4 w-24 rounded bg-grey/20" />
            <div className="mt-4 h-7 w-32 rounded bg-grey/30" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-grey/30 bg-white p-4">
        <div className="h-5 w-40 rounded bg-grey/20" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-4 flex-1 rounded bg-grey/20" />
              <div className="h-4 w-24 rounded bg-grey/20" />
              <div className="h-4 w-20 rounded bg-grey/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
