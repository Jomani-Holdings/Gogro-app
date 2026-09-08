"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, type EmailVariables } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getTemplateBySlug,
  sendEmail,
  logCommunication,
} from "@/lib/mail";

export type SubmissionActionResult = {
  ok: boolean;
  error?: string;
};

const SUBMISSION_STATUSES = [
  "pending",
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
];

export async function updateSubmissionStatus(
  id: string,
  status: string
): Promise<SubmissionActionResult> {
  await requireAdmin();
  if (!SUBMISSION_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("form_submissions")
    .select(
      "lead_id, form_templates(name), leads(full_name, email)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!submission) return { ok: false, error: "Submission not found." };

  const submissionData = submission as Record<string, unknown>;
  const lead = (submissionData.leads as {
    full_name?: string;
    email?: string;
  } | null) ?? null;
  const template = (submissionData.form_templates as {
    name?: string;
  } | null) ?? null;
  const leadId = String(submissionData.lead_id);

  const { error } = await admin
    .from("form_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  const leadStatus =
    status === "approved" || status === "rejected" ? status : "submitted";
  await admin
    .from("leads")
    .update({ status: leadStatus, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if ((status === "approved" || status === "rejected") && lead?.email) {
    const slug = status === "approved" ? "submission_approved_client" : "submission_rejected_client";
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const templateRow = await getTemplateBySlug(admin, slug);
      const clientName = lead.full_name ?? "there";
      const formName = template?.name ?? "application";
      const variables: EmailVariables = {
        "client.name": clientName,
        "form.name": formName,
      };
      await sendEmail({
        resend,
        template: templateRow,
        to: lead.email,
        subjectFallback:
          status === "approved"
            ? "Your application has been approved"
            : "Update on your application",
        htmlFallback:
          status === "approved"
            ? `<h2>You're approved!</h2><p>Hi ${escapeHtml(clientName)}, congratulations — your ${escapeHtml(formName)} has been approved.</p>`
            : `<h2>Update on your application</h2><p>Hi ${escapeHtml(clientName)}, there is an update on your ${escapeHtml(formName)}. Contact support for details.</p>`,
        variables,
      });
    }
    await logCommunication(admin, {
      leadId,
      type: "email",
      direction: "outbound",
      subject:
        status === "approved"
          ? "Application approved"
          : "Application update",
      body: `Status set to ${status}.`,
    });
  }

  revalidatePath("/dashboard/admin/submissions");
  revalidatePath("/dashboard/admin/submissions/${id}");
  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  return { ok: true };
}