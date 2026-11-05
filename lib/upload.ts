import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type UploadFileInput = {
  filename: string;
  contentType: string;
  size: number;
};

export type SignedUpload = {
  bucket: string;
  path: string;
  token: string;
};

export type PrepareUploadResult =
  | { ok: true; upload: SignedUpload }
  | { ok: false; error: string };

export function validateUpload(
  input: UploadFileInput,
  options: {
    maxSize: number;
    allowedMime: (contentType: string) => boolean;
    sizeMessage: string;
    typeMessage: string;
  }
): string | null {
  if (!input.filename || input.size <= 0) {
    return "Please choose a file.";
  }
  if (input.size > options.maxSize) {
    return options.sizeMessage;
  }
  if (!options.allowedMime(input.contentType)) {
    return options.typeMessage;
  }
  return null;
}

export async function createSignedUpload(
  bucket: string,
  path: string
): Promise<PrepareUploadResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Could not prepare the upload.",
    };
  }

  return {
    ok: true,
    upload: {
      bucket,
      path: data.path,
      token: data.token,
    },
  };
}

export async function storedObjectExists(
  bucket: string,
  path: string
): Promise<boolean> {
  const admin = createAdminClient();
  const slash = path.lastIndexOf("/");
  const folder = slash === -1 ? "" : path.slice(0, slash);
  const filename = slash === -1 ? path : path.slice(slash + 1);

  const { data, error } = await admin.storage
    .from(bucket)
    .list(folder, { search: filename, limit: 1 });

  if (error) return false;
  return Boolean(data?.some((item) => item.name === filename));
}
