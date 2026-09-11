"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET, slugifyFilename } from "@/lib/media";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/data/types";

export type DocumentActionResult = {
  ok: boolean;
  error?: string;
};

export const MAX_DOCUMENT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/`);
  return { ok: true };
}

export async function uploadDocument(
  formData: FormData
): Promise<DocumentActionResult> {
  await requireAdmin();

  const leadId = String(formData.get("lead_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const category = String(formData.get("category") ?? "") as DocumentCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: "Invalid document category." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file." };
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    return { ok: false, error: "File is larger than the 5MB limit." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Only PDF, JPG or PNG files are allowed." };
  }

  const admin = createAdminClient();
  const storagePath = `documents/${leadId}/${category}/${crypto.randomUUID()}-${slugifyFilename(file.name)}`;
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
    lead_id: leadId || null,
    user_id: userId || null,
    category,
    filename: file.name,
    storage_path: storagePath,
    status: "pending",
  });
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
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