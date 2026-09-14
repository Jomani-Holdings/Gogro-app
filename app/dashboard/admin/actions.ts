"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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
  revalidatePath(`/dashboard/admin/drivers/${profileId}`);
  return { ok: true };
}
