"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SettingsResult = {
  ok: boolean;
  message?: string;
};

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
