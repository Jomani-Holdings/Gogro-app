"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { GALLERY_BUCKET, slugifyFilename } from "@/lib/media";

export const MAX_GALLERY_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function storageKey(fileName: string): string {
  return `${GALLERY_BUCKET}/${crypto.randomUUID()}-${slugifyFilename(fileName)}`;
}

export async function saveGalleryImage(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const isNew = id === "new" || !id;
  const admin = createAdminClient();

  const caption = clean(formData.get("caption"));
  const altText = clean(formData.get("alt_text"));
  const description = clean(formData.get("description"));
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const active = formData.get("active") === "on";

  const rawFile = formData.get("image");
  const file = rawFile instanceof File ? rawFile : null;
  let storagePath: string | null = null;

  if (file && file.size > 0) {
    if (file.size > MAX_GALLERY_FILE_SIZE) {
      throw new Error("Image is larger than the 5MB limit.");
    }
    storagePath = storageKey(file.name);
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(GALLERY_BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
  }

  if (isNew) {
    if (!storagePath) {
      throw new Error("Please choose an image to upload.");
    }
    const { error } = await admin.from("galleries").insert({
      storage_path: storagePath,
      filename: String(file?.name ?? storagePath.split("/").pop() ?? ""),
      caption,
      alt_text: altText,
      description,
      sort_order: sortOrder,
      active,
    });
    if (error) throw new Error(error.message);
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
      patch.filename = String(file?.name ?? "");
    }
    const { error } = await admin.from("galleries").update(patch).eq("id", id);
    if (error) throw new Error(error.message);

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