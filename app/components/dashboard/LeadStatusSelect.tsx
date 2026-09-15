"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/dashboard/admin/leads/actions";

const options = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "form_sent", label: "Form Sent" },
  { value: "form_started", label: "Form Started" },
  { value: "submitted", label: "Submitted" },
  { value: "documents_requested", label: "Documents Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "dormant", label: "Dormant" },
];

export function LeadStatusSelect({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: string) {
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateLeadStatus(id, next);
        if (!result.ok) {
          setStatus(previous);
          setError(result.error ?? "Something went wrong.");
        }
      } catch (err) {
        setStatus(previous);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="lead-status" className="text-sm font-semibold text-textdark">
        Status
      </label>
      <select
        id="lead-status"
        value={status}
        onChange={(event) => onChange(event.target.value)}
        disabled={saving}
        className="rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark focus:outline-none focus:ring-2 focus:ring-orange/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}