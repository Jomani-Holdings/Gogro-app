import { Crown, Star } from "lucide-react";

const milestones = [
  {
    weeks: 8,
    label: "8 consecutive on-time payments",
    icon: Star,
    accent: "yellow" as const,
  },
  {
    weeks: 12,
    label: "12 consecutive on-time payments",
    icon: Crown,
    accent: "navy" as const,
  },
];

export function StreakProgress({ streak }: { streak: number }) {
  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-navy">Your Progress</h2>

      <div className="mt-5 space-y-6">
        {milestones.map((milestone) => {
          const achieved = streak >= milestone.weeks;
          const current = Math.min(streak, milestone.weeks);
          const percent = Math.round((current / milestone.weeks) * 100);
          const remaining = Math.max(milestone.weeks - streak, 0);
          const Icon = milestone.icon;

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
                    {milestone.label}
                  </p>
                </div>
                <p className="text-sm font-semibold text-textdark shrink-0">
                  {current} / {milestone.weeks}
                </p>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-grey/40">
                <div
                  className={`h-full rounded-full transition-all ${
                    achieved
                      ? "bg-yellow"
                      : milestone.accent === "navy"
                        ? "bg-navy"
                        : "bg-yellow"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p
                className={`text-xs mt-1 ${
                  achieved
                    ? "text-success font-semibold"
                    : "text-textdark/50"
                }`}
              >
                {achieved
                  ? "Bonus earned!"
                  : `${remaining} week${remaining === 1 ? "" : "s"} to go`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
