"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const confirmOverride = formData.get("confirm_override") === "on";

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

  // Warn (but do not block) when a fuel issue would exceed the credit limit.
  if (type === "fuel_issue" && !confirmOverride) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("credit_limit, fuel_balance")
      .eq("id", driverId)
      .maybeSingle();

    const creditLimit = profile?.credit_limit
      ? Number(profile.credit_limit)
      : null;
    const currentBalance = profile?.fuel_balance
      ? Number(profile.fuel_balance)
      : 0;

    if (creditLimit !== null && currentBalance + amount > creditLimit) {
      return {
        ok: false,
        warning: `This fuel issue takes the driver's balance above their credit limit of R${creditLimit.toLocaleString("en-ZA")}. You can log it anyway.`,
        requiresConfirmation: true,
      };
    }
  }

  const created_at =
    createdRaw && !Number.isNaN(Date.parse(createdRaw))
      ? new Date(createdRaw).toISOString()
      : new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("transactions").insert({
    driver_id: driverId,
    vehicle_id: vehicleId,
    garage_id: garageId,
    type,
    amount,
    litres,
    created_at,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/transactions");
  return { ok: true };
}