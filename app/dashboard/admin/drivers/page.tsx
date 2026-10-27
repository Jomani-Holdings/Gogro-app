import Link from "next/link";
import { getAdminDrivers, getAdminGarageOptions } from "@/lib/data/admin";
import { DriversTable } from "@/app/components/dashboard/DriversTable";

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const direction = params.dir === "prev" ? "prev" : "next";
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const garage = typeof params.garage === "string" ? params.garage : "all";
  const suspended = params.suspended === "1";

  const [page, garages] = await Promise.all([
    getAdminDrivers({
      cursor,
      direction,
      query,
      status,
      garage,
      suspended: suspended ? true : undefined,
    }),
    getAdminGarageOptions(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Drivers
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage driver accounts, operational details and status.
          </p>
        </div>
        <Link
          href="/dashboard/admin/drivers/new"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add Driver
        </Link>
      </div>

      <div className="mt-8">
        <DriversTable
          drivers={page.rows}
          garages={garages}
          pageInfo={page}
          filters={{ query, status, garage, suspended }}
        />
      </div>
    </div>
  );
}
