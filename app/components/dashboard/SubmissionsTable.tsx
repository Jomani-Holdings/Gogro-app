"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FormSubmission } from "@/lib/data/types";

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
}: {
  submissions: FormSubmission[];
}) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((submission) => submission.status === filter);
  }, [submissions, filter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === value
                ? "bg-navy text-white border-navy"
                : "bg-white text-textdark border-grey/40 hover:border-navy"
            }`}
          >
            {value === "all" ? "All" : statusLabels[value]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
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
              {filtered.map((submission) => (
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
      </div>
    </div>
  );
}