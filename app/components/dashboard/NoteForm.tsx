"use client";

import { useState, useTransition } from "react";
import { addLeadNote } from "@/app/dashboard/admin/leads/actions";

export function NoteForm({ leadId }: { leadId: string }) {
  const [note, setNote] = useState("");
  const [saving, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message?: string } | null>(
    null
  );

  function submit() {
    if (!note.trim()) return;
    startTransition(async () => {
      try {
        const result = await addLeadNote(leadId, note);
        setStatus(result.ok
          ? { ok: true, message: "Note added." }
          : { ok: false, message: result.error ?? "Could not add note." });
        if (result.ok) setNote("");
      } catch (err) {
        setStatus({
          ok: false,
          message:
            err instanceof Error
              ? err.message
              : "Could not add note. Please try again.",
        });
      }
    });
  }

  return (
    <div>
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about this lead…"
        className="w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
      />
      {status ? (
        <p
          className={`mt-2 text-sm ${
            status.ok ? "text-navy" : "text-error"
          }`}
        >
          {status.message}
        </p>
      ) : null}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          disabled={saving || !note.trim()}
          onClick={submit}
          className="rounded-lg bg-navy text-white font-semibold py-2 px-4 hover:bg-navy/90 disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add note"}
        </button>
      </div>
    </div>
  );
}