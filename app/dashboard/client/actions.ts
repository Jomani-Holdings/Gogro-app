"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { requireClient } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAllAdmins } from "@/lib/notifications";
import { getTemplateBySlug, sendEmail } from "@/lib/mail";
import {
  DOCUMENTS_BUCKET,
  MAX_CLIENT_DOCUMENT_SIZE,
  MAX_PAYMENT_PROOF_SIZE,
  sanitizeStorageKey,
  slugifyFilename,
} from "@/lib/media";
import {
  createSignedUpload,
  storedObjectExists,
  validateUpload,
  type PrepareUploadResult,
  type UploadFileInput,
} from "@/lib/upload";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/data/types";

export type ClientDocumentActionResult = {
  ok: boolean;
  error?: string;
};

const VALID_CATEGORIES = DOCUMENT_CATEGORIES.map((c) => c.value);
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function prepareClientDocumentUpload(input: {
  category: string;
  filename: string;
  contentType: string;
  size: number;
}): Promise<PrepareUploadResult> {
  const profile = await requireClient();
  const user = { id: profile.user_id, email: profile.email };

  const category = input.category as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const validationError = validateUpload(input, {
    maxSize: MAX_CLIENT_DOCUMENT_SIZE,
    allowedMime: (type) => ALLOWED_TYPES.includes(type),
    sizeMessage: "File is larger than the 2MB limit.",
    typeMessage: "Only PDF, JPG or PNG files are allowed.",
  });
  if (validationError) return { ok: false, error: validationError };

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const folder = lead?.id ? String(lead.id) : `user-${user.id}`;
  const storagePath = `documents/${folder}/${category}/${crypto.randomUUID()}-${slugifyFilename(
    input.filename
  )}`;

  return createSignedUpload(DOCUMENTS_BUCKET, storagePath);
}

export async function uploadClientDocument(input: {
  path: string;
  category: string;
  filename: string;
}): Promise<ClientDocumentActionResult> {
  const profile = await requireClient();
  const user = { id: profile.user_id, email: profile.email };

  const category = input.category as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const leadId = lead?.id ? String(lead.id) : null;
  const folder = leadId ? leadId : `user-${user.id}`;

  const safePath = sanitizeStorageKey(input.path, DOCUMENTS_BUCKET);
  const expectedPrefix = `documents/${folder}/${category}/`;
  if (!safePath || !safePath.startsWith(expectedPrefix)) {
    return { ok: false, error: "Invalid upload path." };
  }
  if (!(await storedObjectExists(DOCUMENTS_BUCKET, safePath))) {
    return { ok: false, error: "Upload not found. Please try again." };
  }

  const filename = input.filename.trim() || safePath.split("/").pop() || "file";

  const { error } = await admin.from("documents").insert({
    lead_id: leadId,
    user_id: user.id,
    category,
    filename,
    storage_path: safePath,
    status: "pending",
    uploaded_by: null,
  });
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([safePath]);
    return { ok: false, error: error.message };
  }

  const categoryLabel =
    DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  await notifyAllAdmins({
    title: "Document uploaded",
    body: `${lead?.full_name ?? user.email ?? "A client"} uploaded: ${categoryLabel}.`,
    link: leadId
      ? `${baseUrl}/dashboard/admin/leads/${leadId}`
      : `${baseUrl}/dashboard/admin/drivers`,
    type: "document",
  });

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

export type PaymentProofActionResult = {
  ok: boolean;
  id?: string;
  signedUrl?: string;
  filename?: string;
  error?: string;
};

const PAYMENT_PROOF_SIGNED_URL_TTL = 60 * 60 * 24 * 30; // 30 days

export async function preparePaymentProofUpload(
  input: UploadFileInput
): Promise<PrepareUploadResult> {
  const profile = await requireClient();
  const user = { id: profile.user_id, email: profile.email };

  const validationError = validateUpload(input, {
    maxSize: MAX_PAYMENT_PROOF_SIZE,
    allowedMime: (type) => ALLOWED_TYPES.includes(type),
    sizeMessage: "File is larger than the 5MB limit.",
    typeMessage: "Only PDF, JPG or PNG files are allowed.",
  });
  if (validationError) return { ok: false, error: validationError };

  const storagePath = `payment-proofs/${user.id}/${crypto.randomUUID()}-${slugifyFilename(
    input.filename
  )}`;

  return createSignedUpload(DOCUMENTS_BUCKET, storagePath);
}

export async function uploadPaymentProof(input: {
  path: string;
  filename: string;
}): Promise<PaymentProofActionResult> {
  const profile = await requireClient();
  const user = { id: profile.user_id, email: profile.email };

  const safePath = sanitizeStorageKey(input.path, DOCUMENTS_BUCKET);
  if (!safePath || !safePath.startsWith(`payment-proofs/${user.id}/`)) {
    return { ok: false, error: "Invalid upload path." };
  }
  if (!(await storedObjectExists(DOCUMENTS_BUCKET, safePath))) {
    return { ok: false, error: "Upload not found. Please try again." };
  }

  const filename = input.filename.trim() || safePath.split("/").pop() || "proof";
  const admin = createAdminClient();

  const { data: inserted, error: insertError } = await admin
    .from("payment_proofs")
    .insert({
      user_id: user.id,
      profile_id: profile.id,
      storage_path: safePath,
      filename,
      category: "fuel_repayment",
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([safePath]);
    return { ok: false, error: insertError?.message ?? "Could not save proof." };
  }

  const { data: signed, error: signedError } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(safePath, PAYMENT_PROOF_SIGNED_URL_TTL);
  if (signedError || !signed?.signedUrl) {
    return {
      ok: false,
      error: signedError?.message ?? "Could not create a shareable link.",
    };
  }

  const driverName = profile.full_name ?? user.email ?? "A driver";
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  await notifyAllAdmins({
    title: `New Proof of Payment uploaded by ${driverName}`,
    body: `File: ${filename}`,
    link: `${baseUrl}/dashboard/admin/payments`,
    type: "payment_proof",
  });

  revalidatePath("/dashboard/client/support");
  return {
    ok: true,
    id: String(inserted.id),
    signedUrl: signed.signedUrl,
    filename,
  };
}

export async function deletePaymentProof(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireClient();
  const proofId = String(id ?? "").trim();
  if (!proofId) return { ok: false, error: "Missing proof." };

  const admin = createAdminClient();
  const { data, error: fetchError } = await admin
    .from("payment_proofs")
    .select("id, user_id, storage_path")
    .eq("id", proofId)
    .maybeSingle();

  if (fetchError || !data || String(data.user_id) !== profile.user_id) {
    return { ok: false, error: "Proof not found." };
  }

  const { error: deleteError } = await admin
    .from("payment_proofs")
    .delete()
    .eq("id", proofId);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (data.storage_path) {
    await admin.storage
      .from(DOCUMENTS_BUCKET)
      .remove([String(data.storage_path)]);
  }

  revalidatePath("/dashboard/client/support");
  return { ok: true };
}