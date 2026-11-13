"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Star, type LucideIcon } from "lucide-react";
import { formatPoints } from "@/lib/utils";
import { redeemStreakMilestone } from "@/app/dashboard/client/rewards/actions";

const milestones: {
  weeks: number;
  points: number;
  icon: LucideIcon;
}[] = [
  { weeks: 5, points: 100, icon: Star },
  { weeks: 10, points: 100, icon: Star },
  { weeks: 15, points: 100, icon: Crown },
  { weeks: 20, points: 100, icon: Crown },
];

export function StreakProgress({
  streak,
  redeemedMilestones,
}: {
  streak: number;
  redeemedMilestones: number[];
}) {
  const router = useRouter();
  const [pendingWeeks, setPendingWeeks] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  async function handleRedeem(weeks: number) {
    setPendingWeeks(weeks);
    setErrors((current) => ({ ...current, [weeks]: "" }));
    setMessages((current) => ({ ...current, [weeks]: "" }));

    try {
      const result = await redeemStreakMilestone(weeks);
      if (!result.ok) {
        setErrors((current) => ({
          ...current,
          [weeks]: result.error ?? "Could not redeem this milestone.",
        }));
        return;
      }

      setMessages((current) => ({
        ...current,
        [weeks]: `+${formatPoints(result.points_awarded ?? 100)} added!`,
      }));
      router.refresh();
    } finally {
      setPendingWeeks(null);
    }
  }

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-navy">Your Progress</h2>

      <div className="mt-5 space-y-6">
        {milestones.map((milestone) => {
          const achieved = streak >= milestone.weeks;
          const redeemed = redeemedMilestones.includes(milestone.weeks);
          const current = Math.min(streak, milestone.weeks);
          const percent = Math.round((current / milestone.weeks) * 100);
          const remaining = Math.max(milestone.weeks - streak, 0);
          const Icon = milestone.icon;
          const pending = pendingWeeks === milestone.weeks;

          return (
            <div key={milestone.weeks}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      achieved
                        ? "bg-yellow/20 text-textdark"
                        : "bg-navy/10 text-navy"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <p className="text-sm font-medium text-textdark">
                    {milestone.weeks} consecutive on-time payments
                  </p>
                </div>
                <p className="text-sm font-semibold text-textdark shrink-0">
                  {current} / {milestone.weeks}
                </p>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-grey/40">
                <div
                  className={`h-full rounded-full transition-all ${
                    achieved ? "bg-yellow" : "bg-navy"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {redeemed ? (
                <p className="text-xs mt-1 font-semibold text-success">
                  Claimed — {formatPoints(milestone.points)} added
                </p>
              ) : achieved ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleRedeem(milestone.weeks)}
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-lg bg-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange/90 disabled:opacity-60"
                  >
                    {pending
                      ? "Redeeming…"
                      : `Redeem ${formatPoints(milestone.points)}`}
                  </button>
                  {messages[milestone.weeks] ? (
                    <p className="text-xs mt-1 font-semibold text-success">
                      {messages[milestone.weeks]}
                    </p>
                  ) : null}
                  {errors[milestone.weeks] ? (
                    <p className="text-xs mt-1 font-semibold text-error">
                      {errors[milestone.weeks]}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs mt-1 text-textdark/50">
                  {remaining} week{remaining === 1 ? "" : "s"} to go
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
