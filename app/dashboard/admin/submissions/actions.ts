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

function parseBandUpperBound(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const numbers = value.replace(/\s+/g, "").match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  const upper = Number(numbers[numbers.length - 1]);
  return Number.isFinite(upper) ? upper : null;
}

async function generateFuelCode(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `GG-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("fuel_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  return `GG-${Math.floor(1000 + Math.random() * 9000)}`;
}

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
    .select("lead_id, data, form_templates(name), leads(full_name, email, user_id)")
    .eq("id", id)
    .maybeSingle();

  if (!submission) return { ok: false, error: "Submission not found." };

  const submissionData = submission as Record<string, unknown>;
  const lead = (submissionData.leads as {
    full_name?: string;
    email?: string;
    user_id?: string | null;
  } | null) ?? null;
  const template = (submissionData.form_templates as {
    name?: string;
  } | null) ?? null;
  const leadId = String(submissionData.lead_id);
  const formData =
    submissionData.data && typeof submissionData.data === "object"
      ? (submissionData.data as Record<string, unknown>)
      : {};

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

  if (status === "approved" && lead?.user_id) {
    const carMakeModel = formData.carMakeModelYear
      ? String(formData.carMakeModelYear)
      : null;
    const carRegistration = formData.carRegistration
      ? String(formData.carRegistration)
      : null;
    const creditLimit = parseBandUpperBound(formData.weeklyCreditBand);
    const garageId = formData.garageId ? String(formData.garageId) : null;
    const fuelCode = await generateFuelCode(admin);

    const profilePatch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (carMakeModel) profilePatch.car_make_model = carMakeModel;
    if (carRegistration) profilePatch.car_registration = carRegistration;
    if (creditLimit !== null) profilePatch.credit_limit = creditLimit;
    if (garageId) profilePatch.fuel_garage_id = garageId;
    if (fuelCode) profilePatch.fuel_code = fuelCode;

    const { error: profileError } = await admin
      .from("profiles")
      .update(profilePatch)
      .eq("user_id", lead.user_id);

    if (profileError) return { ok: false, error: profileError.message };
  }

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