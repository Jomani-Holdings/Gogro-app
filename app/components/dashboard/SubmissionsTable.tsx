"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormSubmission } from "@/lib/data/types";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  draft: "bg-grey/40 text-textdark",
  submitted: "bg-navy/10 text-navy",
  in_review: "bg-yellow/20 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

const filters = [
  "all",
  "pending",
  "submitted",
  "in_review",
  "approved",
  "rejected",
] as const;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubmissionsTable({
  submissions,
  pageInfo,
  filters: activeFilters,
}: {
  submissions: FormSubmission[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  filters: { query: string; status: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(activeFilters.query);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("cursor");
    params.delete("dir");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: FormEvent) {
    e.preventDefault();
    navigate({ q: query.trim() || null });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                navigate({ status: value === "all" ? null : value })
              }
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeFilters.status === value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-textdark border-grey/40 hover:border-navy"
              }`}
            >
              {value === "all" ? "All" : statusLabels[value]}
            </button>
          ))}
        </div>
        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lead name…"
            className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No submissions match this filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Form
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">
                  Submitted
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {submission.full_name ?? "—"}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                    {submission.template_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[submission.status] ?? statusStyles.pending
                      }`}
                    >
                      {statusLabels[submission.status] ?? "Pending"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-textdark/60">
                    {formatDate(submission.submitted_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/submissions/${submission.id}`}
                      className="inline-block text-navy font-semibold hover:text-orange"
                    >
                      Submission review &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <CursorPagination
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
          nextCursor={pageInfo.nextCursor}
          prevCursor={pageInfo.prevCursor}
          rowCount={submissions.length}
        />
      </div>
    </div>
  );
}
