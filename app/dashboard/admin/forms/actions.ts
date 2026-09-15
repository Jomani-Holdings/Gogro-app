"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET, MAX_CONTRACT_FILE_SIZE, slugifyFilename } from "@/lib/media";

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function parseJson(raw: FormDataEntryValue | null): JSONContent | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as JSONContent;
  } catch {
    return null;
  }
}

const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "radio",
  "checkbox",
];

function validateFieldSchema(fields: unknown[]): string | null {
  const keys = new Set<string>();

  for (const item of fields) {
    if (typeof item !== "object" || item === null) {
      return "Each form field must be an object.";
    }
    const f = item as Record<string, unknown>;

    if (typeof f.key !== "string" || !f.key.trim()) {
      return "Every field needs a unique key.";
    }
    const key = f.key.trim();
    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      return `Field key "${key}" may only contain letters, numbers, and underscores.`;
    }
    if (keys.has(key)) {
      return `Duplicate field key "${key}".`;
    }
    keys.add(key);

    if (typeof f.label !== "string" || !f.label.trim()) {
      return `Field "${key}" is missing a label.`;
    }
    if (typeof f.type !== "string" || !FIELD_TYPES.includes(f.type)) {
      return `Field "${key}" has an invalid type.`;
    }

    if (f.optionsSource !== undefined && f.optionsSource !== "garages") {
      return `Field "${key}" has an invalid options source.`;
    }

    if (
      (f.type === "select" || f.type === "radio") &&
      f.optionsSource !== "garages" &&
      (!Array.isArray(f.options) || f.options.length === 0)
    ) {
      return `Field "${key}" needs at least one option.`;
    }

    if (f.showWhen !== undefined) {
      if (
        typeof f.showWhen !== "object" ||
        f.showWhen === null ||
        Array.isArray(f.showWhen)
      ) {
        return `Field "${key}" has an invalid show-when condition.`;
      }
      const condition = f.showWhen as Record<string, unknown>;
      for (const [refKey, expected] of Object.entries(condition)) {
        if (!keys.has(refKey)) {
          return `Field "${key}" refers to unknown field "${refKey}" in its show-when condition.`;
        }
        if (expected === undefined || expected === null) {
          return `Field "${key}" has an invalid show-when value.`;
        }
      }
    }
  }

  return null;
}

export async function saveFormTemplate(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "");

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const rawFields = formData.get("field_schema");
  let fieldSchema: unknown[] = [];
  if (typeof rawFields === "string" && rawFields.trim()) {
    try {
      const parsed = JSON.parse(rawFields);
      if (Array.isArray(parsed)) fieldSchema = parsed;
    } catch {
      fieldSchema = [];
    }
  }
  fieldSchema = fieldSchema.filter((item) => item && typeof item === "object");

  if (!fieldSchema.length) {
    throw new Error("A form needs at least one field.");
  }
  const schemaError = validateFieldSchema(fieldSchema);
  if (schemaError) throw new Error(schemaError);

  const patch = {
    name: String(formData.get("name") ?? "").trim(),
    slug,
    service_id: clean(formData.get("service_id")),
    status: String(formData.get("status") ?? "draft"),
    intro_content: parseJson(formData.get("intro_content")),
    field_schema: fieldSchema,
    terms_content: parseJson(formData.get("terms_content")),
    confirmation_message: clean(formData.get("confirmation_message")),
    email_template_slug: clean(formData.get("email_template_slug")),
    sort_order: Number(formData.get("sort_order") ?? 0),
    updated_at: new Date().toISOString(),
  };

  let formId = id;

  if (id === "new") {
    const { data: inserted, error } = await admin
      .from("form_templates")
      .insert(patch)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    formId = String(inserted?.id ?? "");
  } else {
    const { error } = await admin
      .from("form_templates")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  await handleContractDocument(admin, formId, formData);

  revalidatePath("/dashboard/admin/forms");
  redirect("/dashboard/admin/forms");
}

async function handleContractDocument(
  admin: ReturnType<typeof createAdminClient>,
  formId: string,
  formData: FormData
) {
  const remove = formData.get("remove_contract") === "on";
  const file = formData.get("contract_document");

  if (remove) {
    const { data: existing } = await admin
      .from("form_templates")
      .select("contract_document_path")
      .eq("id", formId)
      .maybeSingle();
    if (existing?.contract_document_path) {
      await admin.storage
        .from(DOCUMENTS_BUCKET)
        .remove([String(existing.contract_document_path)]);
    }
    await admin
      .from("form_templates")
      .update({ contract_document_path: null })
      .eq("id", formId);
    return;
  }

  if (!(file instanceof File) || file.size === 0) return;

  if (file.size > MAX_CONTRACT_FILE_SIZE) {
    throw new Error("Contract PDF is larger than the 5MB limit.");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Contract must be a PDF file.");
  }

  const storagePath = `documents/contracts/${formId}/${crypto.randomUUID()}-${slugifyFilename(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw new Error(uploadError.message);

  const { data: existing } = await admin
    .from("form_templates")
    .select("contract_document_path")
    .eq("id", formId)
    .maybeSingle();
  if (existing?.contract_document_path) {
    await admin.storage
      .from(DOCUMENTS_BUCKET)
      .remove([String(existing.contract_document_path)]);
  }

  const { error } = await admin
    .from("form_templates")
    .update({ contract_document_path: storagePath })
    .eq("id", formId);
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }
}

export async function deleteFormTemplate(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("form_templates").delete().eq("id", id);
  revalidatePath("/dashboard/admin/forms");
  redirect("/dashboard/admin/forms");
}