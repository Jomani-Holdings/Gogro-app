"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function CursorPagination({
  hasNextPage,
  hasPreviousPage,
  nextCursor,
  prevCursor,
  rowCount,
}: {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  rowCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function href(cursor: string, direction: "next" | "prev") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", cursor);
    params.set("dir", direction);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-grey/40">
      <p className="text-xs text-textdark/60">
        Showing {rowCount} {rowCount === 1 ? "row" : "rows"}
      </p>

      <div className="flex items-center gap-2">
        {hasPreviousPage && prevCursor ? (
          <Link
            href={href(prevCursor, "prev")}
            className="rounded-md border border-grey/40 px-3 py-1.5 text-sm font-medium text-textdark hover:border-navy"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-grey/20 px-3 py-1.5 text-sm font-medium text-textdark/30">
            Previous
          </span>
        )}

        {hasNextPage && nextCursor ? (
          <Link
            href={href(nextCursor, "next")}
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
    </div>
  );
}
