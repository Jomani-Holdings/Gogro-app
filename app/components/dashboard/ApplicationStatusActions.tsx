"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/app/dashboard/admin/actions";

const options = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationStatusActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, startTransition] = useTransition();

  function onChange(next: string) {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateApplicationStatus(id, next);
      if (!result.ok) {
        setStatus(previous);
      }
    });
  }

  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="status"
        className="text-sm font-semibold text-textdark"
      >
        Status
      </label>
      <select
        id="status"
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

      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving || isApproved}
          onClick={() => onChange("approved")}
          className="flex-1 rounded-lg bg-success text-white font-semibold py-3 px-4 transition-colors hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={saving || isRejected}
          onClick={() => onChange("rejected")}
          className="flex-1 rounded-lg bg-error text-white font-semibold py-3 px-4 transition-colors hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
