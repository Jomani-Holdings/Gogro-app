"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type RedeemPointsResult = {
  ok: boolean;
  error?: string;
  claim_id?: string;
  claim_status?: string;
  voucher_code?: string | null;
};

export async function redeemPoints(
  rewardId: string
): Promise<RedeemPointsResult> {
  const profile = await requireClient();

  if (!rewardId) {
    return { ok: false, error: "Reward is required." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("redeem_driver_points", {
    p_driver_id: profile.id,
    p_reward_id: rewardId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as RedeemPointsResult | null;
  if (!result) {
    return { ok: false, error: "Could not redeem points." };
  }

  revalidatePath("/dashboard/client/rewards");
  revalidatePath("/dashboard/client/finances");
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${profile.id}`);

  return result;
}
