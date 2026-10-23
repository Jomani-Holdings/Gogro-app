import { requireClient } from "@/lib/auth";
import { getClientPointsContext, getClientReferrals } from "@/lib/data/client";
import { PointsHeroCard } from "@/app/components/dashboard/PointsHeroCard";
import { StreakProgress } from "@/app/components/dashboard/StreakProgress";
import { LifetimeRewards } from "@/app/components/dashboard/LifetimeRewards";
import { ClientReferralsTable } from "@/app/components/dashboard/ClientReferralsTable";
import { ReferralShareBar } from "@/app/components/dashboard/ReferralShareBar";

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

  const referrals = await getClientReferrals(context.driver_id);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Rewards
          </h1>
          <p className="text-textdark/60 mt-1">
            Your points, streak and referral earnings.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <PointsHeroCard points={context.points_balance} />
        <StreakProgress streak={context.current_streak} />
        <LifetimeRewards
          earned={context.lifetime_points_earned}
          redeemed={context.lifetime_points_redeemed}
          streak={context.current_streak}
        />
      </div>

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
