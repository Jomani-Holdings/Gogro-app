"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/data/types";

const statusStyles: Record<string, string> = {
  new: "bg-orange/10 text-orange",
  contacted: "bg-yellow/20 text-textdark",
  form_sent: "bg-blue-600/10 text-blue-600",
  form_started: "bg-blue-600/10 text-blue-600",
  submitted: "bg-navy/10 text-navy",
  documents_requested: "bg-yellow/30 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
  dormant: "bg-grey/40 text-textdark",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  form_sent: "Form Sent",
  form_started: "Form Started",
  submitted: "Submitted",
  documents_requested: "Documents Requested",
  approved: "Approved",
  rejected: "Rejected",
  dormant: "Dormant",
};

const filters = [
  "all",
  "new",
  "contacted",
  "form_sent",
  "submitted",
  "documents_requested",
  "approved",
  "rejected",
] as const;

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((lead) => lead.status === filter);
  }, [leads, filter]);

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
            No leads match this filter.
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
                  Service
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">
                  Created
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-textdark">{lead.full_name}</p>
                    <p className="text-textdark/50 md:hidden">{lead.phone}</p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                    {lead.phone ?? "—"}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                    {lead.service_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[lead.status] ?? statusStyles.new
                      }`}
                    >
                      {statusLabels[lead.status] ?? "New"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-textdark/60">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/leads/${lead.id}`}
                      className="inline-block text-navy font-semibold hover:text-orange"
                    >
                      View lead &rarr;
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