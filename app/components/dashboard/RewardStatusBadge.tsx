import type { RewardState } from "@/lib/data/types";

const styles: Record<RewardState, string> = {
  draft: "bg-grey/40 text-textdark",
  scheduled: "bg-navy/10 text-navy",
  teaser: "bg-yellow/20 text-textdark",
  published: "bg-success/10 text-success",
  expired: "bg-grey/40 text-textdark/60",
  archived: "bg-grey/40 text-textdark/60",
};

const labels: Record<RewardState, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  teaser: "Teaser live",
  published: "Published",
  expired: "Expired",
  archived: "Archived",
};

export function RewardStatusBadge({ state }: { state: RewardState }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}
