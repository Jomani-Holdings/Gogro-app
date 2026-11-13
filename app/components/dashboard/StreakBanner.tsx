import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

const MILESTONES = [5, 10, 15, 20] as const;
const MILESTONE_POINTS = 100;

export function StreakBanner({
  streak,
  showRewardsLink = false,
}: {
  streak: number;
  showRewardsLink?: boolean;
}) {
  const nextMilestone = MILESTONES.find((milestone) => milestone > streak);

  if (!nextMilestone || nextMilestone - streak !== 1) {
    return null;
  }

  return (
    <section className="mt-6 flex items-start gap-3 rounded-2xl border border-orange/30 bg-orange/10 p-4">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-white">
        <Trophy size={20} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-textdark">
          You&apos;re 1 week away from {MILESTONE_POINTS} bonus points!
        </p>
        <p className="mt-0.5 text-sm text-textdark/70">
          Make your next payment on time to keep your streak alive and secure
          your bonus.
        </p>
        {showRewardsLink ? (
          <Link
            href="/dashboard/client/rewards"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
          >
            View rewards
            <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
