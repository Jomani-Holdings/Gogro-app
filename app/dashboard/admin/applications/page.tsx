import { getAdminApplications } from "@/lib/data/admin";
import { ApplicationsTable } from "@/app/components/dashboard/ApplicationsTable";

export default async function AdminApplicationsPage() {
  const applications = await getAdminApplications();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Applications
      </h1>
      <p className="text-textdark/60 mt-1">
        Review and move driver applications through your pipeline.
      </p>

      <div className="mt-8">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
