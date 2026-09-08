import { Resend } from "resend";
import type { JSONContent } from "@tiptap/core";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderEmailBody,
  renderEmailSubject,
  type EmailVariables,
} from "@/lib/email";

export const DEFAULT_FROM = "Go Gro Mobility <onboarding@gogromobility.co.za>";

type AdminClient = ReturnType<typeof createAdminClient>;

type EmailTemplateRow = {
  subject: string;
  from_address: string | null;
  reply_to: string | null;
  body: JSONContent | null;
};

export async function getTemplateBySlug(
  admin: AdminClient,
  slug: string
): Promise<EmailTemplateRow | null> {
  const { data, error } = await admin
    .from("email_templates")
    .select("subject, from_address, reply_to, body")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as EmailTemplateRow;
}

export async function sendEmail(params: {
  resend: Resend;
  template: EmailTemplateRow | null;
  to: string;
  subjectFallback: string;
  htmlFallback: string;
  variables: EmailVariables;
}): Promise<{ sent: boolean; reason?: string }> {
  const { resend, template, to, subjectFallback, htmlFallback, variables } =
    params;

  try {
    let subject = subjectFallback;
    let html = htmlFallback;
    let text: string | undefined;

    if (template?.body) {
      const rendered = renderEmailBody(template.body, variables);
      html = rendered.html;
      text = rendered.text;
      subject =
        renderEmailSubject(template.subject, variables) || subjectFallback;
    }

    const { error } = await resend.emails.send({
      from: template?.from_address || DEFAULT_FROM,
      replyTo: template?.reply_to || undefined,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function logCommunication(
  admin: AdminClient,
  params: {
    leadId: string;
    type: "email" | "sms" | "note" | "call";
    direction: "inbound" | "outbound";
    subject?: string | null;
    body?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await admin.from("communications").insert({
    lead_id: params.leadId,
    type: params.type,
    direction: params.direction,
    subject: params.subject ?? null,
    body: params.body ?? null,
    metadata: params.metadata ?? {},
  });
}
