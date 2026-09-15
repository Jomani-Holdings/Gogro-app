"use server";

import { Resend } from "resend";
import { escapeHtml, type EmailVariables } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTemplateBySlug, sendEmail } from "@/lib/mail";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_HOUR = 3;

export type ResetActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestPasswordResetCode(
  _prev: ResetActionState | null,
  formData: FormData
): Promise<ResetActionState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) return { ok: false, error: "Please enter your email address." };

  const admin = createAdminClient();

  const { count } = await admin
    .from("password_reset_codes")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 3600 * 1000).toISOString());

  if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return {
      ok: false,
      error: "Too many reset requests for this email. Please try again later.",
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("user_id, full_name, email")
    .ilike("email", email)
    .maybeSingle();

  // Always return the same message so we don't reveal whether an account exists.
  if (!profile) {
    return {
      ok: true,
      message: "If an account exists for that email, we've sent a reset code.",
    };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { error: insertError } = await admin
    .from("password_reset_codes")
    .insert({
      user_id: profile.user_id,
      email,
      code,
      expires_at: expiresAt,
    });
  if (insertError) {
    return { ok: false, error: "Could not generate a reset code. Please try again." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const template = await getTemplateBySlug(admin, "password_reset_code");
    const variables: EmailVariables = {
      "client.name": profile.full_name ?? "there",
      code,
    };
    const result = await sendEmail({
      resend,
      template,
      to: email,
      subjectFallback: `Your Go Gro Mobility password reset code is ${code}`,
      htmlFallback: `<h2>Password reset</h2><p>Hi ${escapeHtml(profile.full_name ?? "there")},</p><p>Your Go Gro Mobility password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;">${escapeHtml(code)}</p><p>It expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>`,
      variables,
    });
    if (!result.sent) {
      return { ok: false, error: "We couldn't send the reset email. Please try again." };
    }
  }

  return {
    ok: true,
    message: "If an account exists for that email, we've sent a reset code.",
  };
}

export async function verifyPasswordResetCode(
  _prev: ResetActionState | null,
  formData: FormData
): Promise<ResetActionState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { ok: false, error: "Please enter the code from your email." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("password_reset_codes")
    .select("id, code")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "That code is invalid or has expired." };
  }

  return { ok: true, message: "Code verified. Choose a new password." };
}

export async function resetPasswordWithCode(
  _prev: ResetActionState | null,
  formData: FormData
): Promise<ResetActionState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("password_reset_codes")
    .select("id, user_id")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "That code is invalid or has expired." };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    data.user_id,
    { password }
  );
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await admin
    .from("password_reset_codes")
    .update({ used: true })
    .eq("id", data.id);

  return { ok: true, message: "Password updated. You can now sign in." };
}