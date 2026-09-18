"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestDocuments } from "@/app/dashboard/admin/documents/actions";
import {
  getTemplateBySlug,
  sendEmail,
  logCommunication,
} from "@/lib/mail";

export type LeadActionResult = {
  ok: boolean;
  error?: string;
};

const LEAD_STATUSES = [
  "new",
  "contacted",
  "form_sent",
  "form_started",
  "submitted",
  "documents_requested",
  "approved",
  "rejected",
  "dormant",
];

export async function updateLeadStatus(
  id: string,
  status: string
): Promise<LeadActionResult> {
  await requireAdmin();
  if (!LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${id}`);
  return { ok: true };
}

export async function addLeadNote(
  id: string,
  note: string
): Promise<LeadActionResult> {
  await requireAdmin();
  if (!note.trim()) return { ok: false, error: "Note cannot be empty." };

  const admin = createAdminClient();
  const { error } = await admin.from("communications").insert({
    lead_id: id,
    type: "note",
    direction: "inbound",
    subject: "Note",
    body: note.trim(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/admin/leads/${id}`);
  return { ok: true };
}

export async function sendFormInvite(
  leadId: string,
  formTemplateId: string
): Promise<LeadActionResult> {
  await requireAdmin();

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select("full_name, email, user_id")
    .eq("id", leadId)
    .maybeSingle();

  const { data: template } = await admin
    .from("form_templates")
    .select("name, slug, contract_document_path")
    .eq("id", formTemplateId)
    .eq("status", "published")
    .maybeSingle();

  if (!lead || !lead.full_name || !lead.email) {
    return { ok: false, error: "Lead not found or missing contact email." };
  }
  if (!template) {
    return { ok: false, error: "Selected form template is not available." };
  }

  const ttlRaw = process.env.FORM_TOKEN_TTL_DAYS;
  const ttlParsed = Number(ttlRaw || 7);
  const ttlDays = Number.isFinite(ttlParsed) && ttlParsed > 0 ? ttlParsed : 7;
  const accessToken = randomUUID();
  const expiresAt = new Date(
    Date.now() + ttlDays * 24 * 60 * 60 * 1000
  ).toISOString();

  await admin
    .from("form_submissions")
    .delete()
    .eq("lead_id", leadId)
    .eq("form_template_id", formTemplateId)
    .eq("status", "pending");

  const { data: submission, error: insertError } = await admin
    .from("form_submissions")
    .insert({
      lead_id: leadId,
      form_template_id: formTemplateId,
      status: "pending",
      access_token: accessToken,
      access_token_expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insertError || !submission) {
    return { ok: false, error: insertError?.message ?? "Could not create form link." };
  }

  const submissionId = String(submission.id);

  const { error: leadUpdateError } = await admin
    .from("leads")
    .update({ status: "form_sent", updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (leadUpdateError) return { ok: false, error: leadUpdateError.message };

  if (String(template.slug) === "vehicle-rental") {
    const RENTAL_DOCUMENT_CATEGORIES = [
      "id_copy",
      "drivers_license_prdp",
      "proof_of_residence",
      "uber_profile",
      "earnings_statement",
      "selfie",
    ];
    const { data: existing } = await admin
      .from("documents")
      .select("category")
      .eq("lead_id", leadId);
    const existingCategories = new Set(
      (existing ?? []).map((row) => String((row as { category: string }).category))
    );
    const categories = RENTAL_DOCUMENT_CATEGORIES.filter(
      (category) => !existingCategories.has(category)
    );
    if (categories.length > 0 && lead.user_id) {
      await requestDocuments(leadId, String(lead.user_id), categories);
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const link = `${baseUrl}/apply/form/${submissionId}?token=${accessToken}`;
  const variables: EmailVariables = {
    "client.name": lead.full_name,
    "client.email": lead.email,
    "form.name": String(template.name),
    "form.link": link,
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const inviteTemplate = await getTemplateBySlug(
      admin,
      "form_invitation_client"
    );
    await sendEmail({
      resend,
      template: inviteTemplate,
      to: lead.email,
      subjectFallback: `Complete your ${template.name}`,
      htmlFallback: `<h2>Complete your ${escapeHtml(template.name)}</h2><p>Hi ${escapeHtml(lead.full_name)}, please complete your ${escapeHtml(template.name)} using the link below.</p>${emailButton(link, "Complete application")}`,
      variables,
    });

    const contractPath = (template as { contract_document_path?: string | null })
      .contract_document_path;
    if (contractPath) {
      const contractTemplate = await getTemplateBySlug(
        admin,
        "contract_available_client"
      );
      await sendEmail({
        resend,
        template: contractTemplate,
        to: lead.email,
        subjectFallback: `Your ${template.name} contract is ready to sign`,
        htmlFallback: `<h2>Your contract is ready</h2><p>Hi ${escapeHtml(lead.full_name)}, open your application to download, sign and upload your contract.</p>${emailButton(link, "Review & sign contract")}`,
        variables,
      });
    }
  }

  await logCommunication(admin, {
    leadId,
    type: "email",
    direction: "outbound",
    subject: `Application invite: ${template.name}`,
    body: link,
    metadata: { submissionId, formTemplateId },
  });

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  return { ok: true };
}