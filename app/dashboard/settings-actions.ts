"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AVATARS_BUCKET,
  MAX_AVATAR_SIZE,
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

export type SettingsResult = {
  ok: boolean;
  message?: string;
};

const AVATAR_TYPES = ["image/jpeg", "image/png"];

// Storage paths are relative to the avatars bucket. Older rows may still carry
// the bucket name as a prefix, so normalise on the way out.
function avatarObjectPath(stored: string): string {
  return stored.replace(/^avatars\//, "");
}

export async function prepareAvatarUpload(
  input: UploadFileInput
): Promise<PrepareUploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const validationError = validateUpload(input, {
    maxSize: MAX_AVATAR_SIZE,
    allowedMime: (type) => AVATAR_TYPES.includes(type),
    sizeMessage: "Image is larger than the 2MB limit.",
    typeMessage: "Only JPG or PNG images are allowed.",
  });
  if (validationError) return { ok: false, error: validationError };

  const storagePath = `${user.id}/${crypto.randomUUID()}-${slugifyFilename(
    input.filename
  )}`;

  return createSignedUpload(AVATARS_BUCKET, storagePath);
}

export async function updateAvatar(
  storagePath: string
): Promise<SettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const safePath = sanitizeStorageKey(storagePath);
  if (!safePath || !safePath.startsWith(`${user.id}/`)) {
    return { ok: false, message: "Invalid upload path." };
  }
  if (!(await storedObjectExists(AVATARS_BUCKET, safePath))) {
    return { ok: false, message: "Upload not found. Please try again." };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await admin
    .from("profiles")
    .update({
      avatar_url: safePath,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) {
    await admin.storage.from(AVATARS_BUCKET).remove([safePath]);
    return { ok: false, message: error.message };
  }

  if (profile?.avatar_url) {
    await admin.storage
      .from(AVATARS_BUCKET)
      .remove([avatarObjectPath(String(profile.avatar_url))]);
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/client");
  return { ok: true, message: "Profile photo updated." };
}

export async function deleteAvatar(): Promise<SettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.avatar_url) {
    await admin.storage
      .from(AVATARS_BUCKET)
      .remove([avatarObjectPath(String(profile.avatar_url))]);
  }

  const { error } = await admin
    .from("profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/client");
  return { ok: true, message: "Profile photo removed." };
}

export async function updateProfile(
  formData: FormData
): Promise<SettingsResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not signed in." };

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/admin/settings");
  return { ok: true, message: "Profile updated." };
}

export async function updatePassword(
  formData: FormData
): Promise<SettingsResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  if (password !== confirm) {
    return { ok: false, message: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Password updated." };
}
