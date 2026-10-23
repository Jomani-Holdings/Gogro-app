import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClientReward,
  Reward,
  RewardClaim,
  RewardState,
} from "@/lib/data/types";

function asString(value: unknown): string | null {
  return value === null || value === undefined || value === ""
    ? null
    : String(value);
}

function mapReward(row: Record<string, unknown>): Reward {
  const garage = (row.garages as { name?: string } | null) ?? null;

  return {
    id: String(row.id),
    status: String(row.status ?? "draft") as Reward["status"],
    reward_category: String(
      row.reward_category ?? "perk"
    ) as Reward["reward_category"],
    title: asString(row.title),
    description: asString(row.description),
    image_path: asString(row.image_path),
    teaser_title: String(row.teaser_title ?? ""),
    teaser_description: asString(row.teaser_description),
    teaser_image_path: asString(row.teaser_image_path),
    audience: String(row.audience ?? "all_drivers") as Reward["audience"],
    garage_id: asString(row.garage_id),
    garage_name: garage?.name ?? null,
    membership_tier: asString(
      row.membership_tier
    ) as Reward["membership_tier"],
    value_amount:
      row.value_amount === null || row.value_amount === undefined
        ? null
        : Number(row.value_amount),
    point_cost:
      row.point_cost === null || row.point_cost === undefined
        ? null
        : Number(row.point_cost),
    point_reward_type: asString(
      row.point_reward_type
    ) as Reward["point_reward_type"],
    max_claims:
      row.max_claims === null || row.max_claims === undefined
        ? null
        : Number(row.max_claims),
    per_driver_limit: Number(row.per_driver_limit ?? 1),
    teaser_at: asString(row.teaser_at),
    publish_at: String(row.publish_at ?? ""),
    expires_at: asString(row.expires_at),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function computeRewardState(
  reward: Reward,
  now: Date = new Date()
): RewardState {
  if (reward.status === "draft") return "draft";
  if (reward.status === "archived") return "archived";

  const nowMs = now.getTime();
  const publishMs = new Date(reward.publish_at).getTime();
  const teaserMs = reward.teaser_at
    ? new Date(reward.teaser_at).getTime()
    : null;
  const expiresMs = reward.expires_at
    ? new Date(reward.expires_at).getTime()
    : null;

  if (expiresMs !== null && nowMs >= expiresMs) return "expired";
  if (Number.isFinite(publishMs) && nowMs >= publishMs) return "published";
  if (teaserMs !== null && nowMs >= teaserMs) return "teaser";

  return "scheduled";
}

/**
 * Security boundary: real title/description/image are only exposed once the
 * reward is published. While in the teaser window they are replaced with
 * null, so the unrevealed product never reaches the browser payload.
 */
export function maskClientReward(
  reward: Reward,
  now: Date = new Date()
): ClientReward | null {
  const state = computeRewardState(reward, now);
  if (state !== "teaser" && state !== "published") return null;

  const isTeaser = state === "teaser";

  return {
    id: reward.id,
    state,
    reward_category: reward.reward_category,
    title: isTeaser ? null : reward.title,
    description: isTeaser ? null : reward.description,
    image_path: isTeaser ? null : reward.image_path,
    teaser_title: reward.teaser_title,
    teaser_description: reward.teaser_description,
    teaser_image_path: reward.teaser_image_path,
    audience: reward.audience,
    garage_id: reward.garage_id,
    garage_name: reward.garage_name,
    membership_tier: reward.membership_tier,
    value_amount: isTeaser ? null : reward.value_amount,
    publish_at: reward.publish_at,
    expires_at: reward.expires_at,
    sort_order: reward.sort_order,
  };
}

export async function getPublicRewards(): Promise<ClientReward[]> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data, error } = await supabase
    .from("rewards")
    .select("*, garages(name)")
    .eq("status", "scheduled")
    .is("point_cost", null)
    .order("sort_order", { ascending: true })
    .order("publish_at", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[])
    .map((row) => maskClientReward(mapReward(row), now))
    .filter((reward): reward is ClientReward => reward !== null);
}

export async function getAdminRewards(): Promise<Reward[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*, garages(name)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map(mapReward);
}

export async function getAdminReward(id: string): Promise<Reward | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*, garages(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapReward(data as Record<string, unknown>);
}

function mapClaim(row: Record<string, unknown>): RewardClaim {
  const reward =
    (row.rewards as { title?: string | null; teaser_title?: string | null } | null) ??
    null;
  const driver = (row.profiles as { full_name?: string | null } | null) ?? null;

  return {
    id: String(row.id),
    reward_id: String(row.reward_id),
    reward_title: reward?.title ?? reward?.teaser_title ?? null,
    driver_id: String(row.driver_id),
    driver_name: driver?.full_name ?? null,
    status: String(row.status ?? "pending") as RewardClaim["status"],
    voucher_code: asString(row.voucher_code),
    points_redeemed: Number(row.points_redeemed ?? 0),
    redeemed_at: asString(row.redeemed_at),
    notes: asString(row.notes),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminRewardClaims(
  rewardId?: string
): Promise<RewardClaim[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("reward_claims")
    .select("*, rewards(title, teaser_title), profiles(full_name)")
    .order("created_at", { ascending: false });

  if (rewardId) query = query.eq("reward_id", rewardId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map(mapClaim);
}

export async function getDriverRewardClaims(
  driverId: string
): Promise<RewardClaim[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reward_claims")
    .select("*, rewards(title, teaser_title)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map(mapClaim);
}
