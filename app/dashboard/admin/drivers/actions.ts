"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type DriverActionResult = {
  ok: boolean;
  error?: string;
  tempPassword?: string;
};

const DRIVER_STATUSES = ["pending", "active", "suspended", "inactive"];

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

function buildProfilePatch(
  formData: FormData,
  adminProfileId?: string
): Record<string, unknown> {
  const arrangementDueDate = clean(formData.get("payment_arrangement_due_date"));
  return {
    full_name: clean(formData.get("full_name")),
    phone: clean(formData.get("phone")),
    email: clean(formData.get("email")),
    driver_status: String(formData.get("driver_status") ?? "pending"),
    car_make_model: clean(formData.get("car_make_model")),
    car_registration: clean(formData.get("car_registration")),
    id_number: clean(formData.get("id_number")),
    suburb: clean(formData.get("suburb")),
    license_valid: clean(formData.get("license_valid")),
    years_experience: clean(formData.get("years_experience")),
    preferred_vehicle_category: clean(formData.get("preferred_vehicle_category")),
    marketing_source: clean(formData.get("marketing_source")),
    weekly_fuel_limit:
      toNumber(formData.get("weekly_fuel_limit")) ?? 2000,
    fuel_code: clean(formData.get("fuel_code")),
    fuel_garage_id: clean(formData.get("fuel_garage_id")),
    payment_due_day:
      clean(formData.get("payment_due_day")) ?? "tuesday",
    payment_due_time: clean(formData.get("payment_due_time")) ?? "13:00",
    payment_arrangement_due_date: arrangementDueDate,
    payment_arrangement_notes: clean(formData.get("payment_arrangement_notes")),
    payment_arrangement_approved_by: arrangementDueDate
      ? adminProfileId ?? null
      : null,
    updated_at: new Date().toISOString(),
  };
}

async function syncDriverVehicle(
  admin: ReturnType<typeof createAdminClient>,
  driverId: string,
  formData: FormData
): Promise<string | null> {
  const makeModel = clean(formData.get("car_make_model"));
  const registration = clean(formData.get("car_registration"));
  if (!makeModel || !registration) return null;

  const { data: existing } = await admin
    .from("vehicles")
    .select("id")
    .eq("driver_id", driverId)
    .ilike("registration", registration)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("vehicles")
      .update({
        make_model: makeModel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return error ? error.message : null;
  }

  const { data: globalVehicle } = await admin
    .from("vehicles")
    .select("id")
    .ilike("registration", registration)
    .maybeSingle();

  if (globalVehicle) {
    const { error } = await admin
      .from("vehicles")
      .update({
        driver_id: driverId,
        make_model: makeModel,
        ownership_type: "own",
        updated_at: new Date().toISOString(),
      })
      .eq("id", globalVehicle.id);
    return error ? error.message : null;
  }

  const { error } = await admin.from("vehicles").insert({
    driver_id: driverId,
    make_model: makeModel,
    registration,
    ownership_type: "own",
    status: "active",
  });
  return error ? error.message : null;
}

export async function createDriver(formData: FormData): Promise<DriverActionResult> {
  const adminProfile = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Email is required." };

  const admin = createAdminClient();

  const tempPassword = randomBytes(12).toString("base64url");

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: String(formData.get("full_name") ?? "").trim(),
      },
    });

  if (createError) return { ok: false, error: createError.message };

  const userId = created.user?.id;
  if (!userId) return { ok: false, error: "Could not create user." };

  const patch = buildProfilePatch(formData, adminProfile.id);
  delete patch.email;

  const { error } = await admin.from("profiles").upsert(
    {
      user_id: userId,
      role: "client",
      ...patch,
    },
    { onConflict: "user_id" }
  );

  if (error) return { ok: false, error: error.message };

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (profile) {
    const vehicleError = await syncDriverVehicle(admin, profile.id, formData);
    if (vehicleError) return { ok: false, error: vehicleError };
  }

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath("/dashboard/admin/vehicles");
  return { ok: true, tempPassword };
}

export async function updateDriver(
  id: string,
  formData: FormData
): Promise<DriverActionResult> {
  const adminProfile = await requireAdmin();

  const status = String(formData.get("driver_status") ?? "pending");
  if (!DRIVER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid driver status." };
  }

  const patch = buildProfilePatch(formData, adminProfile.id);
  delete patch.email;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  const vehicleError = await syncDriverVehicle(admin, id, formData);
  if (vehicleError) return { ok: false, error: vehicleError };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${id}`);
  revalidatePath("/dashboard/admin/vehicles");
  return { ok: true };
}

export async function setDriverStatus(
  id: string,
  status: string
): Promise<DriverActionResult> {
  await requireAdmin();
  if (!DRIVER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid driver status." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ driver_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${id}`);
  return { ok: true };
}