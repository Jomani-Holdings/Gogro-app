"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminApplication } from "@/lib/data/admin";

const statusStyles: Record<string, string> = {
  new: "bg-orange/10 text-orange",
  in_review: "bg-yellow/20 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
  incomplete: "bg-grey/40 text-textdark",
};

const statusLabels: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  incomplete: "Incomplete",
};

const filters = ["all", "new", "in_review", "approved", "rejected"] as const;

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApplicationsTable({
  applications,
}: {
  applications: AdminApplication[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((app) => app.status === filter);
  }, [applications, filter]);

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
            No applications match this filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Phone
                </th>
                <th className="hidden lg:table-cell px-4 py-3 font-medium">
                  Platform
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">
                  Submitted
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-textdark">
                      {app.full_name ?? "—"}
                    </p>
                    <p className="text-textdark/50 md:hidden">
                      {app.contact_number ?? ""}
                    </p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                    {app.contact_number ?? "—"}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-textdark/80 capitalize">
                    {app.ehailing_platform ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[app.status] ?? statusStyles.incomplete
                      }`}
                    >
                      {statusLabels[app.status] ?? "Incomplete"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-textdark/60">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/applications/${app.id}`}
                      className="inline-block text-navy font-semibold hover:text-orange"
                    >
                      Review &rarr;
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
