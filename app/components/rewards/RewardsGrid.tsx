import { Gift } from "lucide-react";
import type { ClientReward } from "@/lib/data/types";
import { PublishedRewardCard } from "./PublishedRewardCard";
import { TeaserCard } from "./TeaserCard";

export function RewardsGrid({ rewards }: { rewards: ClientReward[] }) {
  if (rewards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-grey/60 bg-white p-10 text-center">
        <Gift size={28} className="mx-auto text-navy/40" />
        <p className="text-textdark/60 mt-3">
          New rewards are being prepared. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rewards.map((reward) =>
        reward.state === "teaser" ? (
          <TeaserCard key={reward.id} reward={reward} />
        ) : (
          <PublishedRewardCard key={reward.id} reward={reward} />
        )
      )}
    </div>
  );
}
