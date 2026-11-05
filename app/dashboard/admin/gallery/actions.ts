"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  GALLERY_BUCKET,
  MAX_GALLERY_FILE_SIZE,
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

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function storageKey(fileName: string): string {
  return `${GALLERY_BUCKET}/${crypto.randomUUID()}-${slugifyFilename(fileName)}`;
}

export async function prepareGalleryImageUpload(
  input: UploadFileInput
): Promise<PrepareUploadResult> {
  await requireAdmin();

  const validationError = validateUpload(input, {
    maxSize: MAX_GALLERY_FILE_SIZE,
    allowedMime: (type) => type.startsWith("image/"),
    sizeMessage: "Image is larger than the 5MB limit.",
    typeMessage: "Please choose an image file.",
  });
  if (validationError) return { ok: false, error: validationError };

  return createSignedUpload(GALLERY_BUCKET, storageKey(input.filename));
}

export async function saveGalleryImage(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isNew = id === "new" || !id;
  const admin = createAdminClient();

  const caption = clean(formData.get("caption"));
  const altText = clean(formData.get("alt_text"));
  const description = clean(formData.get("description"));
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const active = formData.get("active") === "on";

  const rawStoragePath = String(formData.get("storage_path") ?? "").trim();
  const rawFilename = String(formData.get("filename") ?? "").trim();
  let storagePath: string | null = null;

  if (rawStoragePath) {
    const safePath = sanitizeStorageKey(rawStoragePath, GALLERY_BUCKET);
    if (!safePath) throw new Error("Invalid upload path.");
    if (!(await storedObjectExists(GALLERY_BUCKET, safePath))) {
      throw new Error("Upload not found. Please try again.");
    }
    storagePath = safePath;
  }

  if (isNew) {
    if (!storagePath) {
      throw new Error("Please choose an image to upload.");
    }
    const { error } = await admin.from("galleries").insert({
      storage_path: storagePath,
      filename:
        rawFilename || storagePath.split("/").pop() || "image",
      caption,
      alt_text: altText,
      description,
      sort_order: sortOrder,
      active,
    });
    if (error) {
      await admin.storage.from(GALLERY_BUCKET).remove([storagePath]);
      throw new Error(error.message);
    }
  } else {
    const patch: Record<string, unknown> = {
      caption,
      alt_text: altText,
      description,
      sort_order: sortOrder,
      active,
      updated_at: new Date().toISOString(),
    };
    if (storagePath) {
      patch.storage_path = storagePath;
      patch.filename = rawFilename || storagePath.split("/").pop() || "";
    }
    const { error } = await admin.from("galleries").update(patch).eq("id", id);
    if (error) {
      if (storagePath) {
        await admin.storage.from(GALLERY_BUCKET).remove([storagePath]);
      }
      throw new Error(error.message);
    }

    if (storagePath) {
      const oldPath = String(formData.get("existing_storage_path") ?? "");
      if (oldPath) {
        await admin.storage.from(GALLERY_BUCKET).remove([oldPath]);
      }
    }
  }

  revalidatePath("/dashboard/admin/gallery");
  revalidatePath("/gallery");
  redirect("/dashboard/admin/gallery");
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const admin = createAdminClient();

  const { data, error: fetchError } = await admin
    .from("galleries")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !data) throw new Error(fetchError?.message ?? "Not found");

  const { error } = await admin.from("galleries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await admin.storage.from(GALLERY_BUCKET).remove([data.storage_path]);

  revalidatePath("/dashboard/admin/gallery");
  revalidatePath("/gallery");
}

export async function bustGalleryImageCache(id: string): Promise<void> {
  const admin = createAdminClient();

  const { data: image, error: fetchError } = await admin
    .from("galleries")
    .select("storage_path, filename")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !image) throw new Error(fetchError?.message ?? "Not found");

  const oldPath = String(image.storage_path);
  const newPath = storageKey(String(image.filename ?? "image"));

  const { data: existing, error: downloadError } = await admin.storage
    .from(GALLERY_BUCKET)
    .download(oldPath);
  if (downloadError || !existing) throw new Error(downloadError?.message ?? "Not found");

  const bytes = Buffer.from(await existing.arrayBuffer());
  const { error: copyError } = await admin.storage
    .from(GALLERY_BUCKET)
    .upload(newPath, bytes, {
      contentType: existing.type || "application/octet-stream",
      cacheControl: "31536000",
      upsert: false,
    });
  if (copyError) throw new Error(copyError.message);

  const { error: updateError } = await admin
    .from("galleries")
    .update({ storage_path: newPath, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);

  await admin.storage.from(GALLERY_BUCKET).remove([oldPath]);

  revalidatePath("/dashboard/admin/gallery");
  revalidatePath("/gallery");
}