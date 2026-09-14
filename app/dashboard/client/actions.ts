"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTemplateBySlug, sendEmail } from "@/lib/mail";
import { DOCUMENTS_BUCKET, slugifyFilename } from "@/lib/media";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/data/types";

export type ClientDocumentActionResult = {
  ok: boolean;
  error?: string;
};

export const MAX_CLIENT_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_CATEGORIES = DOCUMENT_CATEGORIES.map((c) => c.value);
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function uploadClientDocument(
  formData: FormData
): Promise<ClientDocumentActionResult> {
  const user = await requireUser();

  const category = String(formData.get("category") ?? "") as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file." };
  }
  if (file.size > MAX_CLIENT_DOCUMENT_SIZE) {
    return { ok: false, error: "File is larger than the 5MB limit." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Only PDF, JPG or PNG files are allowed." };
  }

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const leadId = lead?.id ? String(lead.id) : null;

  const folder = leadId ? leadId : `user-${user.id}`;
  const storagePath = `documents/${folder}/${category}/${crypto.randomUUID()}-${slugifyFilename(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error } = await admin.from("documents").insert({
    lead_id: leadId,
    user_id: user.id,
    category,
    filename: file.name,
    storage_path: storagePath,
    status: "pending",
    uploaded_by: null,
  });
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return { ok: false, error: error.message };
  }

  if (category === "signed_contract") {
    const apiKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.TEAM_NOTIFICATION_EMAIL;
    if (apiKey && notifyTo) {
      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
      const reviewLink = leadId
        ? `${baseUrl}/dashboard/admin/leads/${leadId}`
        : `${baseUrl}/dashboard/admin/drivers`;
      const resend = new Resend(apiKey);
      const template = await getTemplateBySlug(admin, "contract_signed_admin");
      const variables: EmailVariables = {
        "client.name": lead?.full_name ?? user.email ?? "A client",
        "admin.reviewLink": reviewLink,
      };
      await sendEmail({
        resend,
        template,
        to: notifyTo,
        subjectFallback: `Signed contract uploaded: ${lead?.full_name ?? user.email ?? "client"}`,
        htmlFallback: `<h2>Signed contract received</h2><p>${escapeHtml(lead?.full_name ?? "A client")} has uploaded a signed contract.</p>${emailButton(reviewLink, "Review signed contract")}`,
        variables,
      });
    }
  }

  revalidatePath("/dashboard/client");
  return { ok: true };
}