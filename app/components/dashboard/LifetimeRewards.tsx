import { Database, Flame, Gift, type LucideIcon } from "lucide-react";
import { formatPoints } from "@/lib/utils";

export function LifetimeRewards({
  earned,
  redeemed,
  streak,
}: {
  earned: number;
  redeemed: number;
  streak: number;
}) {
  const items: { icon: LucideIcon; label: string; value: string }[] = [
    {
      icon: Database,
      label: "Total Points Earned",
      value: formatPoints(earned),
    },
    {
      icon: Gift,
      label: "Total Rewards Redeemed",
      value: formatPoints(redeemed),
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${streak} week${streak === 1 ? "" : "s"}`,
    },
  ];

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-navy">Lifetime Rewards</h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-textdark/50">{item.label}</p>
                <p className="text-base font-semibold text-textdark">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
