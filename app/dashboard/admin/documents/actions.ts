"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { escapeHtml, emailButton, type EmailVariables } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
import { getTemplateBySlug, sendEmail } from "@/lib/mail";
import {
  DOCUMENTS_BUCKET,
  MAX_DOCUMENT_FILE_SIZE,
  sanitizeStorageKey,
  slugifyFilename,
} from "@/lib/media";
import {
  createSignedUpload,
  storedObjectExists,
  validateUpload,
  type PrepareUploadResult,
} from "@/lib/upload";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/data/types";

export type DocumentActionResult = {
  ok: boolean;
  error?: string;
};

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const VALID_CATEGORIES = DOCUMENT_CATEGORIES.map((c) => c.value);

export async function requestDocuments(
  leadId: string,
  userId: string,
  categories: string[]
): Promise<DocumentActionResult> {
  await requireAdmin();

  const valid = categories.filter((c) =>
    VALID_CATEGORIES.includes(c as DocumentCategory)
  );
  if (valid.length === 0) {
    return { ok: false, error: "Select at least one document." };
  }

  const admin = createAdminClient();
  const rows = valid.map((category) => ({
    lead_id: leadId,
    user_id: userId || null,
    category,
    filename: "",
    storage_path: "",
    status: "pending",
  }));

  const { error } = await admin.from("documents").insert(rows);
  if (error) return { ok: false, error: error.message };

  await admin
    .from("leads")
    .update({ status: "documents_requested", updated_at: new Date().toISOString() })
    .eq("id", leadId);

  await admin.from("communications").insert({
    lead_id: leadId,
    type: "note",
    direction: "outbound",
    subject: "Documents requested",
    body: `Requested: ${valid.join(", ")}.`,
  });

  await notifyUser(userId, {
    title: "Documents requested",
    body: "We need a few documents from you before we can continue.",
    link: "/dashboard/client/documents",
    type: "document",
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { data: lead } = await admin
      .from("leads")
      .select("full_name, email")
      .eq("id", leadId)
      .maybeSingle();

    if (lead?.email) {
      const labels = valid
        .map(
          (value) =>
            DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value
        )
        .join(", ");
      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
      const dashboardLink = `${baseUrl}/dashboard/client/documents`;
      const resend = new Resend(apiKey);
      const template = await getTemplateBySlug(admin, "documents_requested_client");
      const variables: EmailVariables = {
        "client.name": lead.full_name ?? "there",
        "document.categories": labels,
        "dashboard.link": dashboardLink,
      };
      await sendEmail({
        resend,
        template,
        to: lead.email,
        subjectFallback: "We need a few documents from you",
        htmlFallback: `<h2>We need a few documents</h2><p>Hi ${escapeHtml(lead.full_name ?? "there")}, please upload the following from your dashboard: ${escapeHtml(labels)}.</p>${emailButton(dashboardLink, "Upload documents")}`,
        variables,
      });
    }
  }

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/`);
  return { ok: true };
}

export async function prepareAdminDocumentUpload(input: {
  leadId: string;
  userId: string;
  category: string;
  filename: string;
  contentType: string;
  size: number;
}): Promise<PrepareUploadResult> {
  await requireAdmin();

  const category = input.category as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const validationError = validateUpload(input, {
    maxSize: MAX_DOCUMENT_FILE_SIZE,
    allowedMime: (type) => ALLOWED_TYPES.includes(type),
    sizeMessage: "File is larger than the 2MB limit.",
    typeMessage: "Only PDF, JPG or PNG files are allowed.",
  });
  if (validationError) return { ok: false, error: validationError };

  const folder = input.leadId || (input.userId ? `user-${input.userId}` : "");
  if (!folder) {
    return { ok: false, error: "Select a client before uploading." };
  }

  const storagePath = `documents/${folder}/${category}/${crypto.randomUUID()}-${slugifyFilename(
    input.filename
  )}`;

  return createSignedUpload(DOCUMENTS_BUCKET, storagePath);
}

export async function uploadDocument(input: {
  leadId: string;
  userId: string;
  category: string;
  path: string;
  filename: string;
}): Promise<DocumentActionResult> {
  await requireAdmin();

  const category = input.category as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const folder = input.leadId || (input.userId ? `user-${input.userId}` : "");
  if (!folder) {
    return { ok: false, error: "Select a client before uploading." };
  }

  const safePath = sanitizeStorageKey(input.path, DOCUMENTS_BUCKET);
  const expectedPrefix = `documents/${folder}/${category}/`;
  if (!safePath || !safePath.startsWith(expectedPrefix)) {
    return { ok: false, error: "Invalid upload path." };
  }
  if (!(await storedObjectExists(DOCUMENTS_BUCKET, safePath))) {
    return { ok: false, error: "Upload not found. Please try again." };
  }

  const filename = input.filename.trim() || safePath.split("/").pop() || "file";
  const admin = createAdminClient();

  const { error } = await admin.from("documents").insert({
    lead_id: input.leadId || null,
    user_id: input.userId || null,
    category,
    filename,
    storage_path: safePath,
    status: "pending",
  });
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([safePath]);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/admin/leads");
  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/`);
  return { ok: true };
}

export async function setDocumentStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<DocumentActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("documents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin/leads");
  return { ok: true };
}

export async function deleteDocument(id: string): Promise<DocumentActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data, error: fetchError } = await admin
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !data) {
    return { ok: false, error: fetchError?.message ?? "Document not found." };
  }

  const { error } = await admin.from("documents").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await admin.storage.from(DOCUMENTS_BUCKET).remove([data.storage_path]);

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin/leads");
  return { ok: true };
}