import Link from "next/link";
import { getAdminGarageOptions } from "@/lib/data/admin";
import { RewardForm } from "@/app/components/dashboard/RewardForm";

export default async function NewRewardPage() {
  const garages = await getAdminGarageOptions();

  return (
    <div>
      <Link
        href="/dashboard/admin/rewards"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to rewards
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        New reward
      </h1>
      <p className="text-textdark/60 mt-1">
        Set up a teaser, schedule the reveal and choose who can claim it.
      </p>

      <div className="mt-8">
        <RewardForm reward={null} garages={garages} isNew />
      </div>
    </div>
  );
}
