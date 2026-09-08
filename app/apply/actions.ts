"use server";

import { randomBytes } from "crypto";
import { waitUntil } from "@vercel/functions";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { expressJoinSchema } from "@/lib/validation/expressJoin";
import {
  getTemplateBySlug,
  sendEmail,
  logCommunication,
} from "@/lib/mail";

export type ApplyActionResult = {
  ok: boolean;
  message?: string;
};

function firstError(message: string) {
  return { ok: false as const, message };
}

export async function submitExpressJoin(
  data: unknown
): Promise<ApplyActionResult> {
  const parsed = expressJoinSchema.safeParse(data);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ??
      "Please check your details and try again.";
    return firstError(message);
  }

  const payload = parsed.data;
  const email = payload.email.trim().toLowerCase();
  const admin = createAdminClient();

  let userId: string | null = null;

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: randomBytes(24).toString("base64url"),
      email_confirm: true,
      user_metadata: { full_name: payload.fullName },
    });

  if (createError || !created.user) {
    const msg = (createError?.message ?? "").toLowerCase();
    if (
      msg.includes("already") ||
      msg.includes("exists") ||
      msg.includes("registered")
    ) {
      const { data: existing } = await admin
        .from("profiles")
        .select("user_id")
        .eq("email", email)
        .maybeSingle();
      userId = existing?.user_id ? String(existing.user_id) : null;
      if (!userId) {
        return firstError(
          "We couldn't find your account. Please contact support."
        );
      }
    } else {
      return firstError("We couldn't create your account. Please try again.");
    }
  } else {
    userId = created.user.id;
  }

  if (!userId) {
    return firstError("We couldn't create your account. Please try again.");
  }

  const { error: upsertError } = await admin.from("leads").upsert(
    {
      user_id: userId,
      service_id: payload.serviceId,
      full_name: payload.fullName,
      email,
      phone: payload.phone,
      status: "new",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (upsertError) {
    return firstError("We couldn't save your details. Please try again.");
  }

  const { data: lead } = await admin
    .from("leads")
    .select("id, services(name)")
    .eq("email", email)
    .maybeSingle();

  const leadId = lead?.id ? String(lead.id) : "";
  const serviceName =
    (lead?.services as { name?: string } | null)?.name ?? "";

  waitUntil(
    sendExpressJoinEmails({
      leadId,
      fullName: payload.fullName,
      email,
      phone: payload.phone,
      serviceName,
    })
  );

  return { ok: true };
}

async function sendExpressJoinEmails(params: {
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  serviceName: string;
}) {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;
  const adminTo =
    process.env.TEAM_NOTIFICATION_EMAIL || "info@gogromobility.co.za";
  if (!apiKey) return;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const resend = new Resend(apiKey);
  const variables: EmailVariables = {
    "client.name": params.fullName,
    "client.email": params.email,
    "client.phone": params.phone,
    "client.service": params.serviceName || "—",
    "admin.reviewLink": params.leadId
      ? `${baseUrl}/dashboard/admin/leads/${params.leadId}`
      : "",
  };

  const adminTemplate = await getTemplateBySlug(admin, "lead_received_admin");
  await sendEmail({
    resend,
    template: adminTemplate,
    to: adminTo,
    subjectFallback: `New lead: ${params.fullName}`,
    htmlFallback: `<h2>New lead</h2><p><strong>Name:</strong> ${escapeHtml(params.fullName)}<br/><strong>Email:</strong> ${escapeHtml(params.email)}<br/><strong>Phone:</strong> ${escapeHtml(params.phone)}<br/><strong>Service:</strong> ${escapeHtml(params.serviceName)}</p>${params.leadId ? emailButton(`${baseUrl}/dashboard/admin/leads/${params.leadId}`, "Review Lead Profile") : ""}`,
    variables,
  });
  await logCommunication(admin, {
    leadId: params.leadId,
    type: "email",
    direction: "outbound",
    subject: `New lead: ${params.fullName}`,
    body: "Lead received (admin notification).",
  });

  const driverTemplate = await getTemplateBySlug(admin, "lead_received_client");
  await sendEmail({
    resend,
    template: driverTemplate,
    to: params.email,
    subjectFallback: "We received your details",
    htmlFallback: `<h2>Thanks, ${escapeHtml(params.fullName)}</h2><p>We have received your details and our team will be in touch shortly.</p>`,
    variables,
  });
  await logCommunication(admin, {
    leadId: params.leadId,
    type: "email",
    direction: "outbound",
    subject: "We received your details",
    body: "Lead received (client confirmation).",
  });
}