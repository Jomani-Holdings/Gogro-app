import { MessageCircle } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { getClientPointsContext, getClientReferrals } from "@/lib/data/client";
import {
  getDriverRewardClaims,
  getDriverRewards,
} from "@/lib/data/rewards";
import { formatDateTime, formatPoints } from "@/lib/utils";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { PointsHeroCard } from "@/app/components/dashboard/PointsHeroCard";
import { StreakProgress } from "@/app/components/dashboard/StreakProgress";
import { StreakBanner } from "@/app/components/dashboard/StreakBanner";
import { LifetimeRewards } from "@/app/components/dashboard/LifetimeRewards";
import { ClientReferralsTable } from "@/app/components/dashboard/ClientReferralsTable";
import { ReferralShareBar } from "@/app/components/dashboard/ReferralShareBar";
import { DriverRewardCard } from "@/app/components/dashboard/DriverRewardCard";
import { TeaserCard } from "@/app/components/rewards/TeaserCard";

const claimStatusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  redeemed: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

export default async function ClientRewardsPage() {
  const profile = await requireClient();
  const context = await getClientPointsContext(profile.user_id);

  if (!context) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-textdark">
          Rewards
        </h1>
        <p className="text-textdark/60 mt-1">
          Your driver profile is still being set up. Rewards will appear here
          once it&apos;s ready.
        </p>
      </div>
    );
  }

  const [referrals, rewards, claims] = await Promise.all([
    getClientReferrals(context.driver_id),
    getDriverRewards(profile.user_id),
    getDriverRewardClaims(context.driver_id),
  ]);

  const claimCounts = new Map<string, number>();
  for (const claim of claims) {
    if (claim.status === "rejected") continue;
    claimCounts.set(
      claim.reward_id,
      (claimCounts.get(claim.reward_id) ?? 0) + 1
    );
  }

  const latestClaimByReward = new Map<string, (typeof claims)[number]>();
  for (const claim of claims) {
    if (!latestClaimByReward.has(claim.reward_id)) {
      latestClaimByReward.set(claim.reward_id, claim);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Rewards
          </h1>
          <p className="text-textdark/60 mt-1">
            Your points, streak, available rewards and referral earnings.
          </p>
        </div>
      </div>

      <StreakBanner streak={context.current_streak} />

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <PointsHeroCard points={context.points_balance} />
        <StreakProgress
          streak={context.current_streak}
          redeemedMilestones={context.redeemed_milestones}
        />
        <LifetimeRewards
          earned={context.lifetime_points_earned}
          redeemed={context.lifetime_points_redeemed}
          streak={context.current_streak}
        />
      </div>

      <section
        id="available-rewards"
        className="bg-white border border-grey/40 rounded-2xl p-6 mt-6 scroll-mt-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-navy">Available Rewards</h2>
          <span className="rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-textdark/60">
            {rewards.length} reward{rewards.length === 1 ? "" : "s"}
          </span>
        </div>

        {rewards.length === 0 ? (
          <p className="text-textdark/60 mt-4">
            No rewards are available for your account right now. Check back
            soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-5">
            {rewards.map((reward) =>
              reward.state === "teaser" ? (
                <TeaserCard key={reward.id} reward={reward} />
              ) : (
                <DriverRewardCard
                  key={reward.id}
                  reward={reward}
                  claimedCount={claimCounts.get(reward.id) ?? 0}
                  driverName={profile.full_name ?? "Driver"}
                  driverId={context.driver_id}
                  latestClaim={latestClaimByReward.get(reward.id) ?? null}
                />
              )
            )}
          </div>
        )}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-navy">My Claims</h2>
          <span className="rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-textdark/60">
            {claims.length} claim{claims.length === 1 ? "" : "s"}
          </span>
        </div>

        {claims.length === 0 ? (
          <p className="text-textdark/60 mt-4">
            You haven&apos;t claimed any rewards yet.
          </p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Reward</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Redeem
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Points</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Claimed
                  </th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                  >
                    <td className="px-4 py-3 text-textdark">
                      {claim.reward_title ?? "Reward"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          claimStatusStyles[claim.status] ??
                          "bg-grey/40 text-textdark"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      {claim.status === "pending" ? (
                        <a
                          href={getWhatsAppLink(
                            `Hi Go Gro Mobility, I'd like to redeem my reward: ${
                              claim.reward_title ?? "Reward"
                            }. Driver: ${
                              profile.full_name ?? "Driver"
                            } (ID: ${context.driver_id}). Claim ref: ${claim.id}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-success hover:underline"
                        >
                          <MessageCircle size={14} />
                          Send
                        </a>
                      ) : (
                        <span className="text-textdark/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-textdark/70">
                      {claim.points_redeemed > 0
                        ? formatPoints(claim.points_redeemed)
                        : "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/70">
                      {formatDateTime(claim.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg font-semibold text-navy">My Referrals</h2>
          <span className="rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-textdark/60">
            {referrals.length} referral{referrals.length === 1 ? "" : "s"}
          </span>
        </div>

        <ClientReferralsTable referrals={referrals} />

        <div className="mt-5">
          <ReferralShareBar code={context.referral_code} />
        </div>
      </section>
    </div>
  );
}
