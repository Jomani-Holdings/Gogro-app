"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderEmailBody, renderEmailSubject } from "@/lib/email";
import { EMAIL_SAMPLE_VALUES } from "@/lib/email-samples";

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

export type TestEmailResult = {
  ok: boolean;
  message?: string;
};

export async function sendTestEmail(formData: FormData): Promise<TestEmailResult> {
  await requireAdmin();

  const to = String(formData.get("to") ?? "").trim();
  if (!to) {
    return { ok: false, message: "Please enter a recipient email address." };
  }

  const subject = String(formData.get("subject") ?? "").trim();

  const bodyRaw = formData.get("body");
  let body: JSONContent | null = null;
  if (typeof bodyRaw === "string" && bodyRaw.trim()) {
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = null;
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, message: "RESEND_API_KEY is not configured." };
  }

  try {
    const renderedSubject =
      renderEmailSubject(subject, EMAIL_SAMPLE_VALUES) || "Test email";
    const { html, text } = renderEmailBody(body, EMAIL_SAMPLE_VALUES);

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Go Gro Mobility <onboarding@gogromobility.co.za>",
      to: [to],
      subject: `[Test] ${renderedSubject}`,
      html: html || "<p>No content</p>",
      text: text || undefined,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: `Test email sent to ${to}` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to send test email.",
    };
  }
}

export async function saveEmailTemplate(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();

  const bodyRaw = formData.get("body");
  let body = null;
  if (typeof bodyRaw === "string" && bodyRaw.trim()) {
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = null;
    }
  }

  const patch = {
    name: String(formData.get("name") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    from_address: clean(formData.get("from_address")),
    reply_to: clean(formData.get("reply_to")),
    body,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("email_templates")
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/email-templates");
  redirect("/dashboard/admin/email-templates");
}
