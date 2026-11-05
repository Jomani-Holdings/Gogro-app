"use client";

import { createClient } from "@/lib/supabase/client";

export type SignedUploadTarget = {
  bucket: string;
  path: string;
  token: string;
};

export async function uploadFileToSignedUrl(
  upload: SignedUploadTarget,
  file: File,
  cacheControl = "3600"
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(upload.bucket)
    .uploadToSignedUrl(upload.path, upload.token, file, {
      contentType: file.type,
      cacheControl,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }
}
