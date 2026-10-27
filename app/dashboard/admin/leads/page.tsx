import { getAdminLeads } from "@/lib/data/admin";
import { LeadsTable } from "@/app/components/dashboard/LeadsTable";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const direction = params.dir === "prev" ? "prev" : "next";
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const page = await getAdminLeads({ cursor, direction, query, status });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Leads</h1>
      <p className="text-textdark/60 mt-1">
        Manage enquiries and move them through your pipeline.
      </p>

      <div className="mt-8">
        <LeadsTable
          leads={page.rows}
          pageInfo={page}
          filters={{ query, status }}
        />
      </div>
    </div>
  );
}
