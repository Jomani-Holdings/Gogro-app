import { getAdminSubmissions } from "@/lib/data/admin";
import { SubmissionsTable } from "@/app/components/dashboard/SubmissionsTable";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const direction = params.dir === "prev" ? "prev" : "next";
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const page = await getAdminSubmissions({
    cursor,
    direction,
    query,
    status,
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Submissions
      </h1>
      <p className="text-textdark/60 mt-1">
        Review, approve and reject completed application forms.
      </p>

      <div className="mt-8">
        <SubmissionsTable
          submissions={page.rows}
          pageInfo={page}
          filters={{ query, status }}
        />
      </div>
    </div>
  );
}
