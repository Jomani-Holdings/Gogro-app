import type { JSONContent } from "@tiptap/core";
import { renderRichText } from "@/lib/tiptap/render";

export type EmailVariables = Record<string, string | number | boolean>;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function emailButton(href: string, label: string): string {
  return `<p style="text-align:center;margin:20px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;background:#F36C21;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">${escapeHtml(label)}</a></p>`;
}

function renderTemplateString(
  value: string,
  variables: EmailVariables,
  escapeVariables = true
): string {
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const raw = variables[key];
    if (raw === undefined || raw === null) return "—";
    const str = String(raw);
    return escapeVariables ? escapeHtml(str) : str;
  });
}

export function renderEmailBody(
  body: JSONContent | null | undefined,
  variables: EmailVariables
): { html: string; text: string } {
  const htmlWithVars = renderRichText(body);
  const html = renderTemplateString(htmlWithVars, variables);
  const text = htmlToPlainText(html);
  return { html, text };
}

export function renderEmailSubject(
  subject: string,
  variables: EmailVariables
): string {
  return renderTemplateString(subject ?? "", variables, false);
}

function htmlToPlainText(html: string): string {
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

export function interpolate(value: string, variables: EmailVariables): string {
  return renderTemplateString(value, variables);
}
