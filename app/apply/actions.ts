"use server";

import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import type { JSONContent } from "@tiptap/core";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderEmailBody,
  renderEmailSubject,
  type EmailVariables,
} from "@/lib/email";
import {
  stepOneSchema,
  stepTwoSchema,
  stepThreeSchema,
} from "@/lib/validation/apply";

export type ApplyActionResult = {
  ok: boolean;
  message?: string;
};

function firstError(message: string) {
  return { ok: false as const, message };
}

const DEFAULT_FROM = "Go Gro Mobility <onboarding@gogromobility.co.za>";

type EmailTemplateRow = {
  subject: string;
  from_address: string | null;
  reply_to: string | null;
  body: JSONContent | null;
};

async function getTemplateBySlug(
  admin: ReturnType<typeof createAdminClient>,
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

async function sendJoinRequestEmails(record: {
  id: string;
  full_name: string | null;
  contact_number: string | null;
  email: string | null;
  id_or_passport_number: string | null;
  physical_address: string | null;
  car_make_model_year: string | null;
  car_registration_number: string | null;
  ehailing_platform: string | null;
  ehailing_platform_other: string | null;
  driver_type: string | null;
  garage_name: string | null;
  weekly_credit_band: string | null;
  heard_about_us: string | null;
  reference_name: string | null;
  deposit_required: boolean | null;
  created_at: string | null;
}) {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;
  const adminTo = process.env.TEAM_NOTIFICATION_EMAIL || "info@gogromobility.co.za";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const reviewLink = baseUrl
    ? `${baseUrl}/dashboard/admin/applications/${record.id}`
    : "";

  const submittedAt = record.created_at
    ? new Date(record.created_at).toLocaleString("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const variables: EmailVariables = {
    "driver.name": record.full_name ?? "—",
    "driver.email": record.email ?? "—",
    "driver.phone": record.contact_number ?? "—",
    "driver.idNumber": record.id_or_passport_number ?? "—",
    "driver.address": record.physical_address ?? "—",
    "driver.car": record.car_make_model_year ?? "—",
    "driver.registration": record.car_registration_number ?? "—",
    "driver.platform":
      record.ehailing_platform === "Other"
        ? record.ehailing_platform_other ?? "Other"
        : record.ehailing_platform ?? "—",
    "driver.driverType": record.driver_type ?? "—",
    "driver.garage": record.garage_name ?? "—",
    "driver.weeklyCreditBand": record.weekly_credit_band ?? "—",
    "driver.referenceName": record.reference_name ?? "None",
    "driver.heardAboutUs": record.heard_about_us ?? "—",
    "driver.depositRequired": record.deposit_required ? "Yes (50%)" : "No",
    "driver.submittedAt": submittedAt,
    "admin.reviewLink": reviewLink,
  };

  const results: Record<string, unknown> = {};

  if (!apiKey) {
    results.reason = "missing RESEND_API_KEY";
    return results;
  }

  const resend = new Resend(apiKey);

  // 1. Admin notification.
  const adminTemplate = await getTemplateBySlug(admin, "join_request_admin");
  await sendEmail({
    resend,
    template: adminTemplate,
    to: adminTo,
    subjectFallback: `New driver application: ${record.full_name ?? "—"}`,
    htmlFallback: fallbackAdminHtml(record, reviewLink, submittedAt),
    variables,
  }).then((r) => {
    results.admin = r;
  });

  // 2. Driver confirmation.
  if (record.email) {
    const driverTemplate = await getTemplateBySlug(admin, "join_request_driver");
    await sendEmail({
      resend,
      template: driverTemplate,
      to: record.email,
      subjectFallback: "We received your application",
      htmlFallback: fallbackDriverHtml(record, submittedAt),
      variables,
    }).then((r) => {
      results.driver = r;
    });
  }

  return results;
}

async function sendEmail(params: {
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
      subject = renderEmailSubject(template.subject, variables) || subjectFallback;
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

function fallbackAdminHtml(
  record: {
    full_name: string | null;
    contact_number: string | null;
    email: string | null;
    id_or_passport_number: string | null;
    physical_address: string | null;
    car_make_model_year: string | null;
    car_registration_number: string | null;
    ehailing_platform: string | null;
    driver_type: string | null;
    garage_name: string | null;
    weekly_credit_band: string | null;
    heard_about_us: string | null;
    reference_name: string | null;
    deposit_required: boolean | null;
  },
  reviewLink: string,
  submittedAt: string
): string {
  const rows: [string, string | null][] = [
    ["Name", record.full_name],
    ["Email", record.email],
    ["Contact", record.contact_number],
    ["ID / Passport", record.id_or_passport_number],
    ["Address", record.physical_address],
    ["Car", record.car_make_model_year],
    ["Registration", record.car_registration_number],
    ["Platform", record.ehailing_platform],
    ["Driver type", record.driver_type],
    ["Garage", record.garage_name],
    ["Weekly credit", record.weekly_credit_band],
    ["Heard about us", record.heard_about_us],
    ["Reference", record.reference_name],
    ["Deposit required", record.deposit_required ? "Yes (50%)" : "No"],
  ];

  const list = rows
    .map(([label, value]) => `<li><strong>${label}:</strong> ${value ?? "—"}</li>`)
    .join("");

  const link = reviewLink
    ? `<p><a href="${reviewLink}">View application in dashboard</a></p>`
    : "";

  return `<h2>New driver application</h2><ul>${list}</ul><p>Submitted at: ${submittedAt}</p>${link}`;
}

function fallbackDriverHtml(
  record: { full_name: string | null },
  submittedAt: string
): string {
  return `<h2>Application received</h2><p>Hi ${record.full_name ?? "there"}, thanks for applying to join Go Gro Mobility. We have received your details and our team will be in touch shortly.</p><p>Submitted at: ${submittedAt}</p>`;
}

export async function submitStepOne(data: unknown): Promise<ApplyActionResult> {
  const parsed = stepOneSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    return firstError(message);
  }

  const payload = parsed.data;
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { full_name: payload.fullName },
  });

  if (createError || !created.user) {
    const msg = (createError?.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return firstError(
        "An account with this email already exists. Please log in instead."
      );
    }
    return firstError("We couldn't create your account. Please try again.");
  }

  const userId = created.user.id;

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (signInError) {
    return firstError(
      "Your account was created but we couldn't sign you in. Please log in."
    );
  }

  const { error: upsertError } = await admin
    .from("applications")
    .upsert(
      {
        user_id: userId,
        full_name: payload.fullName,
        email: payload.email,
        contact_number: payload.contactNumber,
        id_or_passport_number: payload.idOrPassport,
        physical_address: payload.physicalAddress,
        car_make_model_year: payload.carMakeModelYear,
        car_registration_number: payload.carRegistration,
        status: "incomplete",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return firstError(
      "Your account was created, but we couldn't save your details. Please try again."
    );
  }

  return { ok: true };
}

export async function submitStepTwo(data: unknown): Promise<ApplyActionResult> {
  const parsed = stepTwoSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    return firstError(message);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return firstError("Your session has expired. Please log in and try again.");
  }

  const admin = createAdminClient();
  const { error: upsertError } = await admin
    .from("applications")
    .upsert(
      {
        user_id: user.id,
        ehailing_platform: parsed.data.ehailingPlatform,
        ehailing_platform_other: parsed.data.ehailingPlatformOther ?? null,
        driver_type: parsed.data.driverType,
        garage_id: parsed.data.garageId,
        weekly_credit_band: parsed.data.weeklyCreditBand,
        status: "incomplete",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return firstError("We couldn't save your details. Please try again.");
  }

  return { ok: true };
}

export async function submitStepThree(data: unknown): Promise<ApplyActionResult> {
  const parsed = stepThreeSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    return firstError(message);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return firstError("Your session has expired. Please log in and try again.");
  }

  const referenceName = parsed.data.referenceName?.trim() || null;
  const depositRequired = !referenceName;

  const admin = createAdminClient();
  const { error: upsertError } = await admin
    .from("applications")
    .upsert(
      {
        user_id: user.id,
        heard_about_us: parsed.data.heardAboutUs,
        reference_name: referenceName,
        deposit_required: depositRequired,
        status: "new",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return firstError("We couldn't submit your application. Please try again.");
  }

  waitUntil(
    (async () => {
      const { data: record } = await admin
        .from("applications")
        .select(
          "id, full_name, contact_number, email, id_or_passport_number, physical_address, car_make_model_year, car_registration_number, ehailing_platform, ehailing_platform_other, driver_type, weekly_credit_band, heard_about_us, reference_name, deposit_required, created_at, garages(name)"
        )
        .eq("user_id", user.id)
        .single();

      const row = record as (Record<string, unknown> & {
        garages?: { name?: string } | null;
      }) | null;

      const result = await sendJoinRequestEmails({
        id: row?.id ? String(row.id) : "",
        full_name: row?.full_name ? String(row.full_name) : null,
        contact_number: row?.contact_number ? String(row.contact_number) : null,
        email: row?.email ? String(row.email) : null,
        id_or_passport_number: row?.id_or_passport_number
          ? String(row.id_or_passport_number)
          : null,
        physical_address: row?.physical_address
          ? String(row.physical_address)
          : null,
        car_make_model_year: row?.car_make_model_year
          ? String(row.car_make_model_year)
          : null,
        car_registration_number: row?.car_registration_number
          ? String(row.car_registration_number)
          : null,
        ehailing_platform: row?.ehailing_platform
          ? String(row.ehailing_platform)
          : null,
        ehailing_platform_other: row?.ehailing_platform_other
          ? String(row.ehailing_platform_other)
          : null,
        driver_type: row?.driver_type ? String(row.driver_type) : null,
        garage_name: row?.garages?.name ?? null,
        weekly_credit_band: row?.weekly_credit_band
          ? String(row.weekly_credit_band)
          : null,
        heard_about_us: row?.heard_about_us
          ? String(row.heard_about_us)
          : null,
        reference_name: row?.reference_name ? String(row.reference_name) : null,
        deposit_required: row?.deposit_required
          ? Boolean(row.deposit_required)
          : null,
        created_at: row?.created_at ? String(row.created_at) : null,
      });

      await admin
        .from("applications")
        .update({ sync_status: { email: result } })
        .eq("user_id", user.id);
    })()
  );

  return { ok: true };
}
