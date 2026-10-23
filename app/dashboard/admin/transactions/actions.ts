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

export type TransactionActionResult = {
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

const BALANCE_INCREASING_TYPES = new Set([
  "fuel_issue",
  "repair_issue",
  "rental_fee",
  "penalty_fee",
  "balance_correction_increase",
]);

const BALANCE_DECREASING_TYPES = new Set([
  "fuel_repayment",
  "repair_repayment",
  "rental_repayment",
  "balance_correction_decrease",
  "reward_credit",
]);

const CATEGORY_BY_TYPE: Record<
  string,
  "fuel" | "repair" | "rental" | "penalty"
> = {
  fuel_issue: "fuel",
  fuel_repayment: "fuel",
  reward_credit: "fuel",
  repair_issue: "repair",
  repair_repayment: "repair",
  rental_fee: "rental",
  rental_repayment: "rental",
  penalty_fee: "penalty",
  balance_correction_increase: "penalty",
  balance_correction_decrease: "penalty",
};

function transactionImpact(type: string, amount: number) {
  let sign = 0;
  if (BALANCE_INCREASING_TYPES.has(type)) sign = -1;
  else if (BALANCE_DECREASING_TYPES.has(type)) sign = 1;

  return {
    driver: sign * amount,
    category: CATEGORY_BY_TYPE[type] ?? null,
    categoryAmount: sign * amount,
  };
}

function formatRand(value: number): string {
  return `R${Math.abs(value).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function revalidateTransactionPaths(driverId: string | null) {
  revalidatePath("/dashboard/admin/transactions");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/drivers");
  if (driverId) revalidatePath(`/dashboard/admin/drivers/${driverId}`);
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/finances");
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
  const skipNotification = clean(formData.get("skip_notification")) === "true";
  const pointsRaw = clean(formData.get("points_earned"));
  const onTime = clean(formData.get("on_time")) === "true";

  if (!driverId) return { ok: false, error: "Driver is required." };
  if (!type || !TRANSACTION_TYPES.some((t) => t.value === type)) {
    return { ok: false, error: "Invalid transaction type." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  let pointsEarned = 0;
  if (pointsRaw) {
    const n = Number(pointsRaw);
    if (!Number.isInteger(n) || n < 0) {
      return {
        ok: false,
        error: "Points earned must be a whole number of 0 or more.",
      };
    }
    pointsEarned = n;
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
          warning: `This fuel purchase takes the driver's weekly usage above their R${weeklyFuelLimit.toLocaleString("en-ZA")} weekly fuel limit. Authorize the override, or process it as unauthorized to log the R100 penalty.`,
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
    points_earned: pointsEarned,
    created_at,
  };

  if (type === "fuel_issue" && overLimit) {
    insertPayload.authorized_overlimit = overrideAction === "authorize";
  }

  const { error } = await admin.from("transactions").insert(insertPayload);
  if (error) return { ok: false, error: error.message };

  // Streaks are intentionally manual: the admin ticks "on-time" when logging
  // the repayment.
  const REPAYMENT_TYPES = new Set([
    "fuel_repayment",
    "repair_repayment",
    "rental_repayment",
  ]);
  if (onTime && REPAYMENT_TYPES.has(type)) {
    const { data: streakProfile } = await admin
      .from("profiles")
      .select("current_streak")
      .eq("id", driverId)
      .maybeSingle();
    const nextStreak = Number(streakProfile?.current_streak ?? 0) + 1;
    await admin
      .from("profiles")
      .update({
        current_streak: nextStreak,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);
  }

  const typeLabel =
    TRANSACTION_TYPES.find((t) => t.value === type)?.label ?? type;
  const { data: driverProfile } = await admin
    .from("profiles")
    .select("user_id, full_name")
    .eq("id", driverId)
    .maybeSingle();
  if (driverProfile?.user_id && !skipNotification) {
    await notifyUser(String(driverProfile.user_id), {
      title: "Account updated",
      body: `${typeLabel} of R${amount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} has been added to your account.${
        pointsEarned > 0 ? ` +${pointsEarned} reward points earned.` : ""
      }`,
      link: pointsEarned > 0 ? "/dashboard/client/rewards" : "/dashboard/client",
      type: "transaction",
    });
  }

  // Reactivation is a manual admin action. Logging a fuel repayment updates
  // balances only; it never flips the driver back to active.

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
  revalidatePath(`/dashboard/admin/drivers/${driverId}`);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/transactions");
  revalidatePath("/dashboard/admin/rewards");
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/finances");
  revalidatePath("/dashboard/client/rewards");
  return { ok: true };
}

export async function deleteTransaction(
  transactionId: string,
  confirmed = false
): Promise<TransactionActionResult> {
  const profile = await requireAdmin();
  if (!transactionId) return { ok: false, error: "Transaction is required." };

  const admin = createAdminClient();
  const { data: tx, error: txError } = await admin
    .from("transactions")
    .select(
      "id, driver_id, type, amount, reverses_transaction_id, restores_transaction_id"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (txError) return { ok: false, error: txError.message };
  if (!tx) return { ok: false, error: "Transaction not found." };

  if (tx.reverses_transaction_id || tx.restores_transaction_id) {
    return { ok: false, error: "System-generated ledger rows cannot be deleted." };
  }

  const { data: existingDeletion } = await admin
    .from("transaction_deletions")
    .select("id")
    .eq("transaction_id", transactionId)
    .is("restored_at", null)
    .maybeSingle();
  if (existingDeletion) {
    return { ok: false, error: "This transaction is already deleted." };
  }

  const amount = Number(tx.amount ?? 0);
  const impact = transactionImpact(String(tx.type), amount);

  if (!confirmed && (impact.driver < 0 || impact.categoryAmount < 0)) {
    const { data: balances } = await admin
      .from("profiles")
      .select(
        "driver_balance, fuel_balance, repair_balance, rental_balance, penalty_balance"
      )
      .eq("id", tx.driver_id)
      .maybeSingle();

    const row = (balances ?? {}) as Record<string, unknown>;
    const projectedDriver = Number(row.driver_balance ?? 0) + impact.driver;
    const projectedCategory =
      impact.category === null
        ? 0
        : Number(row[`${impact.category}_balance`] ?? 0) +
          impact.categoryAmount;

    if (projectedDriver < 0 || projectedCategory < 0) {
      const parts: string[] = [];
      if (projectedDriver < 0) {
        parts.push(`driver balance of ${formatRand(projectedDriver)}`);
      }
      if (projectedCategory < 0 && impact.category) {
        parts.push(`${impact.category} balance of ${formatRand(projectedCategory)}`);
      }
      return {
        ok: false,
        requiresConfirmation: true,
        warning: `Deleting this transaction puts the ${parts.join(
          " and "
        )} into credit. Continue anyway?`,
      };
    }
  }

  const { error } = await admin.rpc("delete_transaction", {
    p_transaction_id: transactionId,
    p_deleted_by: profile.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidateTransactionPaths(String(tx.driver_id));
  return { ok: true };
}

export async function restoreTransaction(
  transactionId: string
): Promise<TransactionActionResult> {
  const profile = await requireAdmin();
  if (!transactionId) return { ok: false, error: "Transaction is required." };

  const admin = createAdminClient();
  const { data: tx } = await admin
    .from("transactions")
    .select("driver_id")
    .eq("id", transactionId)
    .maybeSingle();

  const { error } = await admin.rpc("restore_transaction", {
    p_transaction_id: transactionId,
    p_restored_by: profile.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidateTransactionPaths(tx?.driver_id ? String(tx.driver_id) : null);
  return { ok: true };
}