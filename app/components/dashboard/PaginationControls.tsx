import Link from "next/link";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("…");
    result.push(page);
    previous = page;
  }
  return result;
}

export function PaginationControls({
  currentPage,
  pageCount,
  total,
  pageSize,
  buildHref,
}: {
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  if (total === 0) return null;

  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-grey/40">
      <p className="text-xs text-textdark/60">
        Showing {first}–{last} of {total}
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              className="rounded-md border border-grey/40 px-3 py-1.5 text-sm font-medium text-textdark hover:border-navy"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-grey/20 px-3 py-1.5 text-sm font-medium text-textdark/30">
              Previous
            </span>
          )}

          {pageWindow(currentPage, pageCount).map((page, index) =>
            page === "…" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-textdark/40"
              >
                …
              </span>
            ) : (
              <Link
                key={page}
                href={buildHref(page)}
                className={
                  page === currentPage
                    ? "rounded-md border border-navy bg-navy px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-md border border-grey/40 px-3 py-1.5 text-sm font-medium text-textdark hover:border-navy"
                }
              >
                {page}
              </Link>
            )
          )}

          {currentPage < pageCount ? (
            <Link
              href={buildHref(currentPage + 1)}
              className="rounded-md border border-grey/40 px-3 py-1.5 text-sm font-medium text-textdark hover:border-navy"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-grey/20 px-3 py-1.5 text-sm font-medium text-textdark/30">
              Next
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
