"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";
import { escapeHtml, type EmailVariables } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
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

const updateSubmissionStatusSchema = z.object({
  id: z.string().uuid(),
  status: z
    .string()
    .refine(
      (value) => SUBMISSION_STATUSES.includes(value),
      "Invalid submission status."
    ),
});

function parseBandUpperBound(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const numbers = value.replace(/\s+/g, "").match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  const upper = Number(numbers[numbers.length - 1]);
  return Number.isFinite(upper) ? upper : null;
}

async function generateFuelCode(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `GG-${randomInt(1000, 10000)}`;
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("fuel_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  return `GG-${randomInt(1000, 10000)}`;
}

export async function updateSubmissionStatus(
  id: string,
  status: string
): Promise<SubmissionActionResult> {
  await requireAdmin();

  const parsed = updateSubmissionStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission or status.",
    };
  }

  id = parsed.data.id;
  status = parsed.data.status;

  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("form_submissions")
    .select("lead_id, data, form_templates(name, slug), leads(full_name, email, user_id)")
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
    slug?: string;
  } | null) ?? null;
  const leadId = String(submissionData.lead_id);
  const formData =
    submissionData.data && typeof submissionData.data === "object"
      ? (submissionData.data as Record<string, unknown>)
      : {};

  if (status === "approved" && lead?.user_id) {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", lead.user_id)
      .maybeSingle();

    if (existingProfile?.role === "admin") {
      return {
        ok: false,
        error: "Cannot change an admin account through submission approval.",
      };
    }
  }

  const profilePatch: Record<string, unknown> = {};
  let leadSource: string | null = null;

  if (status === "approved" && lead?.user_id) {
    const templateSlug = template?.slug ?? "";
    profilePatch.driver_status = "active";

    if (templateSlug === "vehicle-rental") {
      const idNumber = formData.idNumber ? String(formData.idNumber) : null;
      const suburb = formData.suburb ? String(formData.suburb) : null;
      const licenseValid = formData.hasValidLicensePrdp
        ? String(formData.hasValidLicensePrdp)
        : null;
      const yearsExperience = formData.yearsExperience
        ? String(formData.yearsExperience)
        : null;
      const preferredCategory = formData.preferredVehicleCategory
        ? String(formData.preferredVehicleCategory)
        : null;
      const marketingSource = formData.marketingSource
        ? String(formData.marketingSource)
        : null;

      profilePatch.primary_service = "vehicle-rental";
      if (idNumber) profilePatch.id_number = idNumber;
      if (suburb) profilePatch.suburb = suburb;
      if (licenseValid) profilePatch.license_valid = licenseValid;
      if (yearsExperience) profilePatch.years_experience = yearsExperience;
      if (preferredCategory)
        profilePatch.preferred_vehicle_category = preferredCategory;
      if (marketingSource) {
        profilePatch.marketing_source = marketingSource;
        leadSource = marketingSource;
      }
    } else {
      const idNumber = formData.idNumber
        ? String(formData.idNumber)
        : formData.idOrPassport
          ? String(formData.idOrPassport)
          : null;
      const suburbValue = formData.suburb
        ? String(formData.suburb)
        : formData.physicalAddress
          ? String(formData.physicalAddress)
          : null;
      const licenseValid = formData.hasValidLicensePrdp
        ? String(formData.hasValidLicensePrdp)
        : null;
      const yearsExperience = formData.yearsExperience
        ? String(formData.yearsExperience)
        : null;
      const preferredCategory = formData.preferredVehicleCategory
        ? String(formData.preferredVehicleCategory)
        : null;
      const marketingSource = formData.marketingSource
        ? String(formData.marketingSource)
        : formData.heardAboutUs
          ? String(formData.heardAboutUs)
          : null;
      const carMakeModel = formData.carMakeModelYear
        ? String(formData.carMakeModelYear)
        : null;
      const carRegistration = formData.carRegistration
        ? String(formData.carRegistration)
        : null;
      const creditLimit = parseBandUpperBound(formData.weeklyCreditBand);
      const garageId = formData.garageId ? String(formData.garageId) : null;
      const fuelCode = await generateFuelCode(admin);

      profilePatch.primary_service = "fuel-credit";
      if (idNumber) profilePatch.id_number = idNumber;
      if (suburbValue) profilePatch.suburb = suburbValue;
      if (licenseValid) profilePatch.license_valid = licenseValid;
      if (yearsExperience) profilePatch.years_experience = yearsExperience;
      if (preferredCategory)
        profilePatch.preferred_vehicle_category = preferredCategory;
      if (marketingSource) profilePatch.marketing_source = marketingSource;
      if (carMakeModel) profilePatch.car_make_model = carMakeModel;
      if (carRegistration) profilePatch.car_registration = carRegistration;
      if (creditLimit !== null) profilePatch.weekly_fuel_limit = creditLimit;
      if (garageId) profilePatch.fuel_garage_id = garageId;
      if (fuelCode) profilePatch.fuel_code = fuelCode;
    }
  }

  const { data: rpcData, error } = await admin.rpc("update_submission_status", {
    p_submission_id: id,
    p_status: status,
    p_lead_id: leadId,
    p_user_id: lead?.user_id ?? null,
    p_profile_patch: profilePatch,
    p_lead_source: leadSource,
  });

  if (error) return { ok: false, error: error.message };

  const rpcResult = rpcData as { ok?: boolean; error?: string } | null;
  if (!rpcResult?.ok) {
    return {
      ok: false,
      error: rpcResult?.error ?? "Could not update the submission.",
    };
  }

  if ((status === "approved" || status === "rejected") && lead?.email) {
    const slug = status === "approved" ? "submission_approved_client" : "submission_rejected_client";
    const clientName = lead.full_name ?? "there";
    const formName = template?.name ?? "application";
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const templateRow = await getTemplateBySlug(admin, slug);
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

    await notifyUser(lead.user_id, {
      title:
        status === "approved"
          ? "Application approved"
          : "Application update",
      body:
        status === "approved"
          ? `Congratulations — your ${formName} has been approved.`
          : "There is an update on your application. Contact support for details.",
      link: "/dashboard/client",
      type: "submission",
    });
  }

  revalidatePath("/dashboard/admin/submissions");
  revalidatePath(`/dashboard/admin/submissions/${id}`);
  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin");
  return { ok: true };
}