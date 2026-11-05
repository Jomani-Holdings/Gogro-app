"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type DriverActionResult = {
  ok: boolean;
  error?: string;
  tempPassword?: string;
};

const DRIVER_STATUSES = ["pending", "active", "suspended", "inactive"];

const driverStatusSchema = z.enum([
  "pending",
  "active",
  "suspended",
  "inactive",
]);

const driverEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.");

const driverProfilePatchSchema = z.object({
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  driver_status: driverStatusSchema,
  car_make_model: z.string().nullable(),
  car_registration: z.string().nullable(),
  id_number: z.string().nullable(),
  suburb: z.string().nullable(),
  license_valid: z.string().nullable(),
  years_experience: z.string().nullable(),
  preferred_vehicle_category: z.string().nullable(),
  marketing_source: z.string().nullable(),
  weekly_fuel_limit: z.number().positive().finite(),
  fuel_code: z.string().max(50).nullable(),
  fuel_garage_id: z.string().uuid().nullable(),
  payment_due_day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ]),
  payment_due_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Enter a valid payment time."),
  payment_arrangement_due_date: z.string().nullable(),
  payment_arrangement_notes: z.string().nullable(),
  payment_arrangement_approved_by: z.string().uuid().nullable(),
  updated_at: z.string(),
});

function validateProfilePatch(patch: Record<string, unknown>): string | null {
  const parsed = driverProfilePatchSchema.safeParse(patch);
  if (!parsed.success) {
    return (
      parsed.error.issues[0]?.message ?? "Please check the driver details."
    );
  }
  return null;
}

async function isFuelCodeInUse(
  admin: ReturnType<typeof createAdminClient>,
  fuelCode: string | null,
  excludeId?: string
): Promise<boolean> {
  if (!fuelCode) return false;
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("fuel_code", fuelCode)
    .maybeSingle();

  return Boolean(data && String(data.id) !== excludeId);
}

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
  adminProfileId?: string,
  statusDefault = "pending"
): Record<string, unknown> {
  const arrangementDueDate = clean(formData.get("payment_arrangement_due_date"));
  return {
    full_name: clean(formData.get("full_name")),
    phone: clean(formData.get("phone")),
    email: clean(formData.get("email")),
    driver_status: String(formData.get("driver_status") ?? statusDefault),
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

  const emailResult = driverEmailSchema.safeParse(
    String(formData.get("email") ?? "").trim().toLowerCase()
  );
  if (!emailResult.success) {
    return {
      ok: false,
      error:
        emailResult.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }
  const email = emailResult.data;

  const admin = createAdminClient();

  const patch = buildProfilePatch(formData, adminProfile.id, "inactive");
  delete patch.email;

  const patchError = validateProfilePatch(patch);
  if (patchError) return { ok: false, error: patchError };

  const fuelCode = patch.fuel_code ? String(patch.fuel_code) : null;
  if (await isFuelCodeInUse(admin, fuelCode)) {
    return { ok: false, error: "That fuel code is already in use." };
  }

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

  const { error } = await admin.rpc("create_driver_profile_and_vehicle", {
    p_user_id: userId,
    p_patch: patch,
    p_vehicle_make_model: clean(formData.get("car_make_model")),
    p_vehicle_registration: clean(formData.get("car_registration")),
  });

  if (error) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: error.message };
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

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) {
    return { ok: false, error: "Invalid driver." };
  }
  const driverId = idResult.data;

  const statusResult = driverStatusSchema.safeParse(
    String(formData.get("driver_status") ?? "pending")
  );
  if (!statusResult.success) {
    return { ok: false, error: "Invalid driver status." };
  }

  const patch = buildProfilePatch(formData, adminProfile.id);
  delete patch.email;

  const patchError = validateProfilePatch(patch);
  if (patchError) return { ok: false, error: patchError };

  const admin = createAdminClient();

  const fuelCode = patch.fuel_code ? String(patch.fuel_code) : null;
  if (await isFuelCodeInUse(admin, fuelCode, driverId)) {
    return { ok: false, error: "That fuel code is already in use." };
  }

  const { error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", driverId);

  if (error) return { ok: false, error: error.message };

  const vehicleError = await syncDriverVehicle(admin, driverId, formData);
  if (vehicleError) return { ok: false, error: vehicleError };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${driverId}`);
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
    .update({
      driver_status: status,
      suspended: status === "suspended",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${id}`);
  return { ok: true };
}

export async function resetStreak(id: string): Promise<DriverActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      current_streak: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin/drivers");
  revalidatePath(`/dashboard/admin/drivers/${id}`);
  revalidatePath("/dashboard/client/rewards");
  return { ok: true };
}

export async function awardReferralPoints(
  referralId: string,
  points: number
): Promise<DriverActionResult> {
  await requireAdmin();

  if (!Number.isInteger(points) || points <= 0) {
    return {
      ok: false,
      error: "Enter a whole number of points greater than zero.",
    };
  }

  const referralIdResult = z.string().uuid().safeParse(referralId);
  if (!referralIdResult.success) {
    return { ok: false, error: "Invalid referral." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.rpc("award_referral_points", {
    p_referral_id: referralIdResult.data,
    p_points: points,
  });

  if (error) return { ok: false, error: error.message };

  const result = data as {
    ok?: boolean;
    error?: string;
    referrer_id?: string;
  } | null;

  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error ?? "Could not award referral points.",
    };
  }

  revalidatePath("/dashboard/admin/drivers");
  if (result.referrer_id) {
    revalidatePath(`/dashboard/admin/drivers/${result.referrer_id}`);
  }
  revalidatePath("/dashboard/client/rewards");
  return { ok: true };
}