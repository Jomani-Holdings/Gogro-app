"use client";

import { useMemo, useState, useTransition } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/tiptap/extensions";
import {
  RichTextEditor,
  type EditorVariable,
} from "@/app/components/dashboard/RichTextEditor";
import {
  saveEmailTemplate,
  sendTestEmail,
} from "@/app/dashboard/admin/email-template-actions";
import { EMAIL_SAMPLE_VALUES } from "@/lib/email-samples";
import type { EmailTemplate } from "@/lib/data/admin";

function interpolate(value: string, variables: Record<string, string>): string {
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const raw = variables[key];
    return raw === undefined ? "—" : raw;
  });
}

function htmlToText(html: string): string {
  return html
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|h[1-6]|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

export function EmailTemplateForm({ template }: { template: EmailTemplate }) {
  const [body, setBody] = useState<JSONContent | null>(template.body);
  const [subject, setSubject] = useState(template.subject);
  const [tab, setTab] = useState<"html" | "text">("html");
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message?: string;
  } | null>(null);
  const [isSending, startSend] = useTransition();

  const previewHtml = useMemo(() => {
    if (!body) return "";
    try {
      return interpolate(generateHTML(body, editorExtensions), EMAIL_SAMPLE_VALUES);
    } catch {
      return "";
    }
  }, [body]);

  const previewText = useMemo(() => htmlToText(previewHtml), [previewHtml]);
  const previewSubject = useMemo(
    () => interpolate(subject, EMAIL_SAMPLE_VALUES),
    [subject]
  );

  const handleSendTest = () => {
    const formData = new FormData();
    formData.append("to", testTo);
    formData.append("subject", subject);
    formData.append("body", body ? JSON.stringify(body) : "");
    startSend(async () => {
      const result = await sendTestEmail(formData);
      setTestResult(result);
    });
  };

  return (
    <div className="space-y-6">
      <form action={saveEmailTemplate} className="space-y-6">
        <input type="hidden" name="id" value={template.id} />
        <input
          type="hidden"
          name="body"
          value={body ? JSON.stringify(body) : ""}
        />

        <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-navy">Details</h2>

          <div>
            <label className="block text-sm font-medium text-textdark mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={template.name}
              className="w-full rounded-lg border border-grey/60 px-3 py-2 text-sm text-textdark focus:outline-none focus:border-navy"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textdark mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-grey/60 px-3 py-2 text-sm text-textdark focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textdark mb-1">
                From address
              </label>
              <input
                type="text"
                name="from_address"
                defaultValue={template.from_address ?? ""}
                placeholder="Go Gro Mobility <onboarding@gogromobility.co.za>"
                className="w-full rounded-lg border border-grey/60 px-3 py-2 text-sm text-textdark focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textdark mb-1">
              Reply-to
            </label>
            <input
              type="text"
              name="reply_to"
              defaultValue={template.reply_to ?? ""}
              className="w-full rounded-lg border border-grey/60 px-3 py-2 text-sm text-textdark focus:outline-none focus:border-navy"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90"
            >
              Save template
            </button>
          </div>
        </div>
      </form>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-grey/40 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Content</h2>
          <RichTextEditor
            value={body}
            onChange={setBody}
            variables={template.variables as EditorVariable[]}
          />
        </div>

        <div className="bg-white border border-grey/40 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Preview</h2>

          <div className="rounded-lg border border-grey/40 overflow-hidden mb-4">
            <div className="px-4 py-2 bg-grey/20 border-b border-grey/30">
              <p className="text-xs text-textdark/60">
                <span className="font-semibold">Subject:</span>{" "}
                {previewSubject || "—"}
              </p>
            </div>
            <div className="p-4 bg-white">
              <FieldRow
                label="From"
                value={template.from_address ?? "—"}
              />
              <FieldRow label="To" value={template.slug.includes("driver") ? "driver@example.com" : "admin@example.com"} />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTab("html")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "html"
                  ? "bg-navy text-white"
                  : "bg-grey/20 text-textdark"
              }`}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => setTab("text")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "text"
                  ? "bg-navy text-white"
                  : "bg-grey/20 text-textdark"
              }`}
            >
              Plain text
            </button>
          </div>

          <div className="rounded-lg border border-grey/40 overflow-hidden">
            {tab === "html" ? (
              <div
                className="prose prose-sm max-w-none p-4 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_a]:text-orange [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:mt-2"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <pre className="p-4 text-sm whitespace-pre-wrap text-textdark font-sans">
                {previewText || "No content"}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-navy">Send test email</h2>
          <p className="text-sm text-textdark/60 mt-1">
            Send a preview of this template (using sample data) to an email
            address to check how it looks in an inbox.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-grey/60 px-3 py-2 text-sm text-textdark focus:outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy text-white font-semibold py-2.5 px-5 hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send test email"}
          </button>
        </div>

        {testResult && (
          <p
            className={`text-sm ${
              testResult.ok ? "text-navy" : "text-error"
            }`}
          >
            {testResult.message}
          </p>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1 border-b border-grey/20 last:border-0">
      <span className="text-xs text-textdark/50">{label}:</span>{" "}
      <span className="text-sm text-textdark">{value}</span>
    </div>
  );
}
