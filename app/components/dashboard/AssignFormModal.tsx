"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateHTML } from "@tiptap/html";
import { X } from "lucide-react";
import { editorExtensions } from "@/lib/tiptap/extensions";
import type { FormTemplate } from "@/lib/data/types";
import { sendFormInvite } from "@/app/dashboard/admin/leads/actions";

export function AssignFormModal({
  leadId,
  forms,
  disabled,
}: {
  leadId: string;
  forms: FormTemplate[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [sending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(
    null
  );

  const selected = forms.find((form) => form.id === selectedId) ?? null;

  const previewHtml = useMemo(() => {
    if (!selected?.intro_content) return "";
    try {
      return generateHTML(selected.intro_content, editorExtensions);
    } catch {
      return "";
    }
  }, [selected]);

  function send() {
    if (!selectedId) return;
    setResult(null);
    startTransition(async () => {
      const res = await sendFormInvite(leadId, selectedId);
      setResult(
        res.ok
          ? { ok: true, message: "Application invite sent." }
          : { ok: false, message: res.error ?? "Could not send invite." }
      );
      if (res.ok) router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || forms.length === 0}
        onClick={() => {
          setSelectedId("");
          setResult(null);
          setOpen(true);
        }}
        className="rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Assign Form
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-textdark">
                Assign Application Form
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-textdark/50 hover:text-textdark"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-textdark mb-1.5">
                Form Template
              </label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark focus:outline-none focus:ring-2 focus:ring-orange/60"
              >
                <option value="" disabled>
                  Select a form
                </option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div className="mt-6 border border-grey/40 rounded-xl p-5">
                <h4 className="font-semibold text-navy">{selected.name}</h4>
                {previewHtml ? (
                  <div
                    className="prose prose-sm max-w-none mt-2 [&_p]:mt-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : null}
                <ul className="mt-3 space-y-1 text-sm text-textdark/70">
                  {selected.field_schema.map((field) => (
                    <li key={field.key} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange" />
                      {field.label}
                      {field.required && (
                        <span className="text-error">*</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result ? (
              <p
                className={`mt-4 text-sm ${
                  result.ok ? "text-navy" : "text-error"
                }`}
              >
                {result.message}
              </p>
            ) : null}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={sending || !selectedId}
                onClick={send}
                className="flex-1 rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send Application Invite"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-navy text-navy font-semibold py-3 px-6 hover:bg-navy/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}