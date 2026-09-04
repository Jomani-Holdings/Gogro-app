import type { JSONContent } from "@tiptap/core";
import { renderRichText } from "@/lib/tiptap/render";

export type EmailVariables = Record<string, string | number | boolean>;

function renderTemplateString(
  value: string,
  variables: EmailVariables
): string {
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const raw = variables[key];
    if (raw === undefined || raw === null) return "—";
    return String(raw);
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
  return renderTemplateString(subject ?? "", variables);
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
