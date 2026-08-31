"use server";

import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

async function sendTeamNotification(record: {
  full_name: string | null;
  contact_number: string | null;
  email: string | null;
  ehailing_platform: string | null;
  driver_type: string | null;
  weekly_credit_band: string | null;
  reference_name: string | null;
  deposit_required: boolean | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    return { sent: false, reason: "missing RESEND_API_KEY or TEAM_NOTIFICATION_EMAIL" };
  }

  try {
    const resend = new Resend(apiKey);
    const lines = [
      `Name: ${record.full_name ?? "—"}`,
      `Contact: ${record.contact_number ?? "—"}`,
      `Email: ${record.email ?? "—"}`,
      `Platform: ${record.ehailing_platform ?? "—"}`,
      `Driver type: ${record.driver_type ?? "—"}`,
      `Weekly credit: ${record.weekly_credit_band ?? "—"}`,
      `Reference: ${record.reference_name ?? "None"}`,
      `Deposit required: ${record.deposit_required ? "Yes" : "No"}`,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: "Go Gro Mobility <onboarding@gogromobility.co.za>",
      to: [to],
      subject: "New Go Gro driver application",
      text: `A new application was submitted:\n\n${lines}`,
    });

    if (error) {
      return { sent: false, reason: error.message };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown" };
  }
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
          "full_name, contact_number, email, ehailing_platform, driver_type, weekly_credit_band, reference_name, deposit_required"
        )
        .eq("user_id", user.id)
        .single();

      const result = await sendTeamNotification(record ?? {
        full_name: null,
        contact_number: null,
        email: null,
        ehailing_platform: null,
        driver_type: null,
        weekly_credit_band: null,
        reference_name: null,
        deposit_required: null,
      });

      await admin
        .from("applications")
        .update({ sync_status: { email: result } })
        .eq("user_id", user.id);
    })()
  );

  return { ok: true };
}
