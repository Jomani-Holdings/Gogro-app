"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

  if (id === "new") {
    const { error } = await admin.from("form_templates").insert(patch);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin
      .from("form_templates")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/forms");
  redirect("/dashboard/admin/forms");
}

export async function deleteFormTemplate(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("form_templates").delete().eq("id", id);
  revalidatePath("/dashboard/admin/forms");
  redirect("/dashboard/admin/forms");
}