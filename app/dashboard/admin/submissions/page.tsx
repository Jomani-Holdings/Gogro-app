import { getAdminSubmissions } from "@/lib/data/admin";
import { SubmissionsTable } from "@/app/components/dashboard/SubmissionsTable";

export default async function AdminSubmissionsPage() {
  const submissions = await getAdminSubmissions();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Submissions
      </h1>
      <p className="text-textdark/60 mt-1">
        Review, approve and reject completed application forms.
      </p>

      <div className="mt-8">
        <SubmissionsTable submissions={submissions} />
      </div>
    </div>
  );
}