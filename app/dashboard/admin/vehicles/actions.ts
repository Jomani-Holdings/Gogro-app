"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VehicleStatus, VehicleOwnership } from "@/lib/data/types";

export type VehicleActionResult = {
  ok: boolean;
  error?: string;
};

const VEHICLE_STATUSES: VehicleStatus[] = ["active", "maintenance", "off_road"];
const VEHICLE_OWNERSHIPS: VehicleOwnership[] = ["own", "rental", "managed"];

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function toNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function buildVehiclePatch(formData: FormData): Record<string, unknown> {
  return {
    make_model: clean(formData.get("make_model")),
    registration: clean(formData.get("registration")),
    driver_id: clean(formData.get("driver_id")),
    owner_name: clean(formData.get("owner_name")),
    category: clean(formData.get("category")),
    ownership_type: String(formData.get("ownership_type") ?? "managed"),
    weekly_rental: toNumber(formData.get("weekly_rental")),
    status: String(formData.get("status") ?? "active"),
    updated_at: new Date().toISOString(),
  };
}

export async function createVehicle(
  formData: FormData
): Promise<VehicleActionResult> {
  await requireAdmin();

  const patch = buildVehiclePatch(formData);
  if (!patch.make_model) return { ok: false, error: "Vehicle make and model is required." };
  if (!patch.registration) return { ok: false, error: "Registration is required." };
  if (!VEHICLE_STATUSES.includes(patch.status as VehicleStatus)) {
    return { ok: false, error: "Invalid vehicle status." };
  }
  if (!VEHICLE_OWNERSHIPS.includes(patch.ownership_type as VehicleOwnership)) {
    return { ok: false, error: "Invalid ownership type." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("vehicles").insert(patch);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A vehicle with this registration already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/admin/vehicles");
  return { ok: true };
}

export async function updateVehicle(
  id: string,
  formData: FormData
): Promise<VehicleActionResult> {
  await requireAdmin();

  const patch = buildVehiclePatch(formData);
  if (!patch.make_model) return { ok: false, error: "Vehicle make and model is required." };
  if (!patch.registration) return { ok: false, error: "Registration is required." };
  if (!VEHICLE_STATUSES.includes(patch.status as VehicleStatus)) {
    return { ok: false, error: "Invalid vehicle status." };
  }
  if (!VEHICLE_OWNERSHIPS.includes(patch.ownership_type as VehicleOwnership)) {
    return { ok: false, error: "Invalid ownership type." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("vehicles").update(patch).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A vehicle with this registration already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/admin/vehicles");
  revalidatePath(`/dashboard/admin/vehicles/${id}`);
  return { ok: true };
}

export async function deleteVehicle(id: string): Promise<VehicleActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("vehicles").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/vehicles");
  return { ok: true };
}