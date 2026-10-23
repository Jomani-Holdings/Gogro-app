import Link from "next/link";
import Image from "next/image";
import { Gift } from "lucide-react";
import {
  computeRewardState,
  getAdminRewardClaims,
  getAdminRewards,
} from "@/lib/data/rewards";
import { mediaUrl } from "@/lib/media";
import { formatDateTime, formatPoints } from "@/lib/utils";
import { RewardStatusBadge } from "@/app/components/dashboard/RewardStatusBadge";
import { RewardRowActions } from "@/app/components/dashboard/RewardRowActions";

export default async function AdminRewardsPage() {
  const [rewards, claims] = await Promise.all([
    getAdminRewards(),
    getAdminRewardClaims(),
  ]);

  const claimCounts = new Map<string, number>();
  for (const claim of claims) {
    claimCounts.set(
      claim.reward_id,
      (claimCounts.get(claim.reward_id) ?? 0) + 1
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Rewards
          </h1>
          <p className="text-textdark/60 mt-1">
            Create teaser campaigns, schedule reveals and manage giveaways.
          </p>
        </div>
        <Link
          href="/dashboard/admin/rewards/new"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          New reward
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {rewards.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No rewards yet. Create your first teaser campaign to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Preview</th>
                  <th className="px-4 py-3 font-medium">Teaser</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Reward
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Audience
                  </th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Reveal
                  </th>
                  <th className="px-4 py-3 font-medium text-center">Claims</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => {
                  const state = computeRewardState(reward);
                  const preview = reward.image_path ?? reward.teaser_image_path;

                  return (
                    <tr
                      key={reward.id}
                      className="border-b border-grey/20 last:border-0 hover:bg-offwhite align-top"
                    >
                      <td className="px-4 py-3">
                        <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-grey/30 bg-offwhite flex items-center justify-center">
                          {preview ? (
                            <Image
                              src={mediaUrl(preview)}
                              alt={reward.title ?? reward.teaser_title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <Gift size={22} className="text-navy/40" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[16rem]">
                        <p className="font-medium text-textdark">
                          {reward.teaser_title}
                        </p>
                        {reward.teaser_description ? (
                          <p className="text-xs text-textdark/50 mt-0.5 line-clamp-2">
                            {reward.teaser_description}
                          </p>
                        ) : null}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 max-w-[16rem]">
                        <p className="text-textdark">
                          {reward.title ?? (
                            <span className="text-textdark/40">Not set</span>
                          )}
                        </p>
                        <p className="text-xs text-textdark/50 mt-0.5 capitalize">
                          {reward.reward_category.replace(/_/g, " ")}
                        </p>
                        {reward.point_cost ? (
                          <p className="text-xs font-semibold text-success mt-1">
                            {formatPoints(reward.point_cost)}
                            {reward.point_reward_type
                              ? ` · ${reward.point_reward_type.replace(/_/g, " ")}`
                              : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-textdark/70">
                        <p className="capitalize">
                          {reward.audience.replace(/_/g, " ")}
                        </p>
                        {reward.garage_name ? (
                          <p className="text-xs text-textdark/50 mt-0.5">
                            {reward.garage_name}
                          </p>
                        ) : null}
                        {reward.membership_tier ? (
                          <p className="text-xs text-textdark/50 mt-0.5 capitalize">
                            {reward.membership_tier}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <RewardStatusBadge state={state} />
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-textdark/70 whitespace-nowrap">
                        <p>{formatDateTime(reward.publish_at)}</p>
                        {reward.expires_at ? (
                          <p className="text-xs text-textdark/50 mt-0.5">
                            Ends {formatDateTime(reward.expires_at)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-center text-textdark/70">
                        {claimCounts.get(reward.id) ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-2">
                          <Link
                            href={`/dashboard/admin/rewards/${reward.id}/edit`}
                            className="text-navy font-semibold hover:text-orange"
                          >
                            Edit
                          </Link>
                          <RewardRowActions
                            id={reward.id}
                            name={reward.title ?? reward.teaser_title}
                            state={state}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
