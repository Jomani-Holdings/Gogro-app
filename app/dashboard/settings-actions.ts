"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AVATARS_BUCKET,
  MAX_AVATAR_SIZE,
  slugifyFilename,
} from "@/lib/media";

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

export async function updateAvatar(formData: FormData): Promise<SettingsResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Please choose an image." };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { ok: false, message: "Image is larger than the 2MB limit." };
  }
  if (!AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: "Only JPG or PNG images are allowed." };
  }

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

  const storagePath = `${user.id}/${crypto.randomUUID()}-${slugifyFilename(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(AVATARS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) return { ok: false, message: uploadError.message };

  const { error } = await admin
    .from("profiles")
    .update({
      avatar_url: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) {
    await admin.storage.from(AVATARS_BUCKET).remove([storagePath]);
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
