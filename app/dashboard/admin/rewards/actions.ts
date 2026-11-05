"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  REWARDS_BUCKET,
  MAX_REWARD_IMAGE_SIZE,
  sanitizeStorageKey,
  slugifyFilename,
} from "@/lib/media";
import {
  createSignedUpload,
  storedObjectExists,
  validateUpload,
  type PrepareUploadResult,
  type UploadFileInput,
} from "@/lib/upload";
import { rewardSchema } from "@/lib/validation/rewards";

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

function toIso(value: FormDataEntryValue | null): string | null {
  const raw = clean(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toNumber(value: FormDataEntryValue | null): number | null {
  const raw = clean(value);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function storageKey(fileName: string): string {
  return `${REWARDS_BUCKET}/${crypto.randomUUID()}-${slugifyFilename(fileName)}`;
}

export async function prepareRewardImageUpload(
  input: UploadFileInput
): Promise<PrepareUploadResult> {
  await requireAdmin();

  const validationError = validateUpload(input, {
    maxSize: MAX_REWARD_IMAGE_SIZE,
    allowedMime: (type) => type.startsWith("image/"),
    sizeMessage: "Image is larger than the 5MB limit.",
    typeMessage: "Please choose an image file.",
  });
  if (validationError) return { ok: false, error: validationError };

  return createSignedUpload(REWARDS_BUCKET, storageKey(input.filename));
}

function revalidateRewards(): void {
  revalidatePath("/dashboard/admin/rewards");
  revalidatePath("/rewards");
  revalidatePath("/dashboard/client/rewards");
  revalidatePath("/dashboard/client");
}

export async function saveReward(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const isNew = id === "new" || !id;

  const parsed = rewardSchema.safeParse({
    status: clean(formData.get("status")) ?? "draft",
    reward_category: clean(formData.get("reward_category")) ?? "perk",
    teaser_title: String(formData.get("teaser_title") ?? ""),
    teaser_description: clean(formData.get("teaser_description")),
    title: clean(formData.get("title")),
    description: clean(formData.get("description")),
    audience: clean(formData.get("audience")) ?? "all_drivers",
    garage_id: clean(formData.get("garage_id")),
    membership_tier: clean(formData.get("membership_tier")),
    value_amount: toNumber(formData.get("value_amount")),
    point_cost: toNumber(formData.get("point_cost")),
    point_reward_type: clean(formData.get("point_reward_type")),
    max_claims: toNumber(formData.get("max_claims")),
    per_driver_limit: toNumber(formData.get("per_driver_limit")) ?? 1,
    teaser_at: clean(formData.get("teaser_at")),
    publish_at: clean(formData.get("publish_at")) ?? "",
    expires_at: clean(formData.get("expires_at")),
    sort_order: toNumber(formData.get("sort_order")) ?? 0,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid reward details.");
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const rawImagePath = String(formData.get("image_path") ?? "").trim();
  const rawTeaserPath = String(
    formData.get("teaser_image_path") ?? ""
  ).trim();

  let imagePath: string | null = null;
  let teaserImagePath: string | null = null;

  if (rawImagePath) {
    const safePath = sanitizeStorageKey(rawImagePath, REWARDS_BUCKET);
    if (!safePath) throw new Error("Invalid image upload path.");
    if (!(await storedObjectExists(REWARDS_BUCKET, safePath))) {
      throw new Error("Image upload not found. Please try again.");
    }
    imagePath = safePath;
  }

  if (rawTeaserPath) {
    const safePath = sanitizeStorageKey(rawTeaserPath, REWARDS_BUCKET);
    if (!safePath) throw new Error("Invalid teaser image upload path.");
    if (!(await storedObjectExists(REWARDS_BUCKET, safePath))) {
      throw new Error("Teaser image upload not found. Please try again.");
    }
    teaserImagePath = safePath;
  }

  const newPaths = [imagePath, teaserImagePath].filter(
    (path): path is string => Boolean(path)
  );

  const patch: Record<string, unknown> = {
    status: input.status,
    reward_category: input.reward_category,
    teaser_title: input.teaser_title,
    teaser_description: input.teaser_description,
    title: input.title,
    description: input.description,
    audience: input.audience,
    garage_id: input.audience === "garage_specific" ? input.garage_id : null,
    membership_tier:
      input.audience === "tier_specific" ? input.membership_tier : null,
    value_amount: input.value_amount,
    point_cost: input.point_cost,
    point_reward_type: input.point_reward_type,
    max_claims: input.max_claims,
    per_driver_limit: input.per_driver_limit,
    teaser_at: toIso(input.teaser_at ?? null),
    publish_at: toIso(input.publish_at),
    expires_at: toIso(input.expires_at ?? null),
    sort_order: input.sort_order,
    updated_at: new Date().toISOString(),
  };

  if (isNew) {
    if (!patch.publish_at) {
      throw new Error("Enter a valid publish date.");
    }
    if (imagePath) patch.image_path = imagePath;
    if (teaserImagePath) patch.teaser_image_path = teaserImagePath;

    const { error } = await admin.from("rewards").insert(patch);
    if (error) {
      if (newPaths.length > 0) {
        await admin.storage.from(REWARDS_BUCKET).remove(newPaths);
      }
      throw new Error(error.message);
    }
  } else {
    if (!patch.publish_at) {
      throw new Error("Enter a valid publish date.");
    }

    const previousImage = clean(formData.get("existing_image_path"));
    const previousTeaser = clean(formData.get("existing_teaser_image_path"));

    if (imagePath) patch.image_path = imagePath;
    if (teaserImagePath) patch.teaser_image_path = teaserImagePath;

    const { error } = await admin.from("rewards").update(patch).eq("id", id);
    if (error) {
      if (newPaths.length > 0) {
        await admin.storage.from(REWARDS_BUCKET).remove(newPaths);
      }
      throw new Error(error.message);
    }

    if (imagePath && previousImage && previousImage !== imagePath) {
      await admin.storage.from(REWARDS_BUCKET).remove([previousImage]);
    }
    if (teaserImagePath && previousTeaser && previousTeaser !== teaserImagePath) {
      await admin.storage.from(REWARDS_BUCKET).remove([previousTeaser]);
    }
  }

  revalidateRewards();
  redirect("/dashboard/admin/rewards");
}

export async function archiveReward(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("rewards")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateRewards();
}

export async function deleteReward(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from("rewards")
    .select("image_path, teaser_image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("rewards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const paths = [data?.image_path, data?.teaser_image_path].filter(
    (path): path is string => typeof path === "string" && path.length > 0
  );
  if (paths.length > 0) {
    await admin.storage.from(REWARDS_BUCKET).remove(paths);
  }

  revalidateRewards();
}

export async function duplicateReward(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("rewards")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Reward not found.");

  const row = data as Record<string, unknown>;
  const insert = {
    status: "draft",
    reward_category: row.reward_category,
    title: row.title,
    description: row.description,
    image_path: row.image_path,
    teaser_title: `${String(row.teaser_title ?? "Reward")} (copy)`,
    teaser_description: row.teaser_description,
    teaser_image_path: row.teaser_image_path,
    audience: row.audience,
    garage_id: row.garage_id,
    membership_tier: row.membership_tier,
    value_amount: row.value_amount,
    point_cost: row.point_cost,
    point_reward_type: row.point_reward_type,
    max_claims: row.max_claims,
    per_driver_limit: row.per_driver_limit,
    teaser_at: row.teaser_at,
    publish_at: row.publish_at,
    expires_at: row.expires_at,
    sort_order: row.sort_order,
  };

  const { error: insertError } = await admin.from("rewards").insert(insert);
  if (insertError) throw new Error(insertError.message);

  revalidateRewards();
}
