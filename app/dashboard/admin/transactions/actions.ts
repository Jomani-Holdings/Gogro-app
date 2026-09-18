"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
import {
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/lib/data/types";

export type LogTransactionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
  requiresConfirmation?: boolean;
};

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

export async function logTransaction(
  formData: FormData
): Promise<LogTransactionResult> {
  await requireAdmin();

  const driverId = clean(formData.get("driver_id"));
  const type = clean(formData.get("type")) as TransactionType | null;
  const amount = Number(formData.get("amount") ?? 0);
  const litresRaw = clean(formData.get("litres"));
  const vehicleId = clean(formData.get("vehicle_id"));
  const garageId = clean(formData.get("garage_id"));
  const createdRaw = clean(formData.get("created_at"));
  const overrideAction = clean(formData.get("override_action"));

  if (!driverId) return { ok: false, error: "Driver is required." };
  if (!type || !TRANSACTION_TYPES.some((t) => t.value === type)) {
    return { ok: false, error: "Invalid transaction type." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  let litres: number | null = null;
  if (litresRaw) {
    const n = Number(litresRaw);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "Litres must be a positive number." };
    }
    litres = n;
  }

  const admin = createAdminClient();

  // Warn (then require an explicit choice) when a fuel issue would exceed the
  // driver's weekly fuel limit for the current Tue-Mon cycle.
  let overLimit = false;
  let weeklyFuelLimit = 2000;
  if (type === "fuel_issue") {
    const { data: profile } = await admin
      .from("driver_account_summary")
      .select("weekly_fuel_limit, weekly_fuel_issued, overlimit_count")
      .eq("id", driverId)
      .maybeSingle();

    weeklyFuelLimit = profile?.weekly_fuel_limit
      ? Number(profile.weekly_fuel_limit)
      : 2000;
    const weeklyIssued = profile?.weekly_fuel_issued
      ? Number(profile.weekly_fuel_issued)
      : 0;

    if (weeklyIssued + amount > weeklyFuelLimit) {
      overLimit = true;
      if (overrideAction !== "authorize" && overrideAction !== "unauthorized") {
        return {
          ok: false,
          warning: `This fuel issue takes the driver's weekly usage above their R${weeklyFuelLimit.toLocaleString("en-ZA")} weekly fuel limit. Authorize the override, or process it as unauthorized to log the R100 penalty.`,
          requiresConfirmation: true,
        };
      }
    }
  }

  const created_at =
    createdRaw && !Number.isNaN(Date.parse(createdRaw))
      ? new Date(createdRaw).toISOString()
      : new Date().toISOString();

  const insertPayload: Record<string, unknown> = {
    driver_id: driverId,
    vehicle_id: vehicleId,
    garage_id: garageId,
    type,
    amount,
    litres,
    created_at,
  };

  if (type === "fuel_issue" && overLimit) {
    insertPayload.authorized_overlimit = overrideAction === "authorize";
  }

  const { error } = await admin.from("transactions").insert(insertPayload);
  if (error) return { ok: false, error: error.message };

  const typeLabel =
    TRANSACTION_TYPES.find((t) => t.value === type)?.label ?? type;
  const { data: driverProfile } = await admin
    .from("profiles")
    .select("user_id, full_name")
    .eq("id", driverId)
    .maybeSingle();
  if (driverProfile?.user_id) {
    await notifyUser(String(driverProfile.user_id), {
      title: "Account updated",
      body: `${typeLabel} of R${amount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} has been added to your account.`,
      link: "/dashboard/client",
      type: "transaction",
    });
  }

  // Unauthorized over-limit fuel issue: auto-log the R100 penalty fee.
  if (type === "fuel_issue" && overLimit && overrideAction === "unauthorized") {
    const penaltyPayload: Record<string, unknown> = {
      driver_id: driverId,
      vehicle_id: vehicleId,
      garage_id: garageId,
      type: "penalty_fee",
      amount: 100,
      created_at,
    };

    const { error: penaltyError } = await admin
      .from("transactions")
      .insert(penaltyPayload);
    if (penaltyError) return { ok: false, error: penaltyError.message };

    const { data: profile } = await admin
      .from("profiles")
      .select("overlimit_count")
      .eq("id", driverId)
      .maybeSingle();
    const currentCount = Number(profile?.overlimit_count ?? 0);

    await admin
      .from("profiles")
      .update({
        overlimit_count: currentCount + 1,
        last_penalty_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);
  }

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/transactions");
  return { ok: true };
}