"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/admin/applications");
  revalidatePath(`/dashboard/admin/applications/${id}`);
  return { ok: true };
}

export async function setDriverSuspended(
  profileId: string,
  suspended: boolean
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ suspended, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/admin/drivers");
  return { ok: true };
}
