import { getAdminLeads } from "@/lib/data/admin";
import { LeadsTable } from "@/app/components/dashboard/LeadsTable";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Leads</h1>
      <p className="text-textdark/60 mt-1">
        Manage enquiries and move them through your pipeline.
      </p>

      <div className="mt-8">
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}