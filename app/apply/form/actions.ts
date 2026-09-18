"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAllAdmins } from "@/lib/notifications";
import { getPublicForm } from "@/lib/data/apply-public";
import { buildDynamicSchema } from "@/lib/validation/dynamicForm";
import {
  getTemplateBySlug,
  sendEmail,
  logCommunication,
} from "@/lib/mail";

export type FormActionResult = {
  ok: boolean;
  message?: string;
};

export async function submitPublicForm(
  submissionId: string,
  token: string,
  data: Record<string, unknown>
): Promise<FormActionResult> {
  const payload = await getPublicForm(submissionId, token);
  if (!payload) {
    return { ok: false, message: "This form link is invalid or has expired." };
  }
  if (payload.status === "submitted") {
    return { ok: false, message: "This form has already been submitted." };
  }

  const schema = buildDynamicSchema(
    payload.template.field_schema,
    payload.garages
  );
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ??
      "There was a problem with your submission.";
    return { ok: false, message };
  }

  const submissionData = parsed.data as Record<string, unknown>;

  if (payload.template.slug === "fuel-credit") {
    const referenceName = String(submissionData.referenceName ?? "");
    submissionData.depositRequired = referenceName.trim().length === 0;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("form_submissions")
    .update({
      data: submissionData,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) return { ok: false, message: error.message };

  const prev = payload.lead;
  const fullName = String(submissionData.fullName ?? prev.full_name ?? "").trim();
  const email = String(submissionData.email ?? prev.email ?? "")
    .trim()
    .toLowerCase();
  const phone = String(submissionData.phone ?? prev.phone ?? "").trim();

  if (prev.user_id && email && email !== prev.email.toLowerCase()) {
    const { error: updateUserError } =
      await admin.auth.admin.updateUserById(prev.user_id, {
        email,
        email_confirm: true,
      });
    if (updateUserError) {
      return {
        ok: false,
        message: "We couldn't update your email address. Please contact support.",
      };
    }
  }

  await admin
    .from("leads")
    .update({
      full_name: fullName || prev.full_name,
      email: email || prev.email,
      phone: phone || prev.phone,
      status: "submitted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.leadId);

  await sendSubmissionEmails({
    leadId: payload.leadId,
    fullName: fullName || prev.full_name,
    email: email || prev.email,
    formName: payload.template.name,
    submissionId,
  });

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  await notifyAllAdmins({
    title: "Application submitted",
    body: `${fullName || prev.full_name || "A client"} submitted their ${
      payload.template.name
    }.`,
    link: `${baseUrl}/dashboard/admin/submissions/${submissionId}`,
    type: "submission",
  });

  return { ok: true };
}

export async function createPasswordForSubmission(
  submissionId: string,
  token: string,
  password: string
): Promise<FormActionResult> {
  const payload = await getPublicForm(submissionId, token);
  if (!payload) {
    return { ok: false, message: "This link is invalid or has expired." };
  }

  if (payload.status !== "submitted") {
    return {
      ok: false,
      message:
        "Please submit the application form before creating your password.",
    };
  }

  const userId = payload.lead.user_id;
  if (!userId) {
    return { ok: false, message: "We couldn't find your account." };
  }

  if (!password || password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password,
  });
  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await admin
    .from("form_submissions")
    .update({
      access_token: null,
      access_token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  revalidatePath("/dashboard/admin/leads");
  revalidatePath("/dashboard/admin/submissions");

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: payload.lead.email,
    password,
  });
  if (signInError) {
    return {
      ok: false,
      message: "Your password was set, but we couldn't sign you in. Please log in.",
    };
  }

  redirect("/dashboard/client");
}

async function sendSubmissionEmails(params: {
  leadId: string;
  fullName: string;
  email: string;
  formName: string;
  submissionId: string;
}) {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;
  const adminTo = process.env.TEAM_NOTIFICATION_EMAIL || "info@gogromobility.co.za";
  if (!apiKey) return;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const resend = new Resend(apiKey);
  const variables: EmailVariables = {
    "client.name": params.fullName,
    "client.email": params.email,
    "form.name": params.formName,
    "admin.reviewLink": baseUrl
      ? `${baseUrl}/dashboard/admin/submissions/${params.submissionId}`
      : "",
  };

  const adminTemplate = await getTemplateBySlug(admin, "form_submitted_admin");
  await sendEmail({
    resend,
    template: adminTemplate,
    to: adminTo,
    subjectFallback: `Application submitted: ${params.fullName}`,
    htmlFallback: `<h2>Application submitted</h2><p>${escapeHtml(params.fullName)} submitted their ${escapeHtml(params.formName)}.</p>${baseUrl ? emailButton(`${baseUrl}/dashboard/admin/submissions/${params.submissionId}`, "Review Application") : ""}`,
    variables,
  });
  await logCommunication(admin, {
    leadId: params.leadId,
    type: "email",
    direction: "outbound",
    subject: `Application submitted: ${params.fullName}`,
    body: "Form submitted (admin notification).",
  });

  const driverTemplate = await getTemplateBySlug(admin, "form_submitted_client");
  await sendEmail({
    resend,
    template: driverTemplate,
    to: params.email,
    subjectFallback: `We received your ${params.formName}`,
    htmlFallback: `<h2>Application received</h2><p>Hi ${escapeHtml(params.fullName)}, we have received your ${escapeHtml(params.formName)}.</p>`,
    variables,
  });
  await logCommunication(admin, {
    leadId: params.leadId,
    type: "email",
    direction: "outbound",
    subject: `We received your ${params.formName}`,
    body: "Form submitted (client confirmation).",
  });
}