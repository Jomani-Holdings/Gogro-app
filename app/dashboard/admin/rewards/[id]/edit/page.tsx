import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminGarageOptions } from "@/lib/data/admin";
import { getAdminReward } from "@/lib/data/rewards";
import { RewardForm } from "@/app/components/dashboard/RewardForm";

export default async function EditRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reward, garages] = await Promise.all([
    getAdminReward(id),
    getAdminGarageOptions(),
  ]);

  if (!reward) notFound();

  return (
    <div>
      <Link
        href="/dashboard/admin/rewards"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to rewards
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit reward — {reward.teaser_title}
      </h1>
      <p className="text-textdark/60 mt-1">
        Update the teaser, reveal copy, image or schedule.
      </p>

      <div className="mt-8">
        <RewardForm reward={reward} garages={garages} isNew={false} />
      </div>
    </div>
  );
}
