import Link from "next/link";
import { getAdminDrivers } from "@/lib/data/admin";
import { DriversTable } from "@/app/components/dashboard/DriversTable";

export default async function AdminDriversPage() {
  const drivers = await getAdminDrivers();

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
        <DriversTable drivers={drivers} />
      </div>
    </div>
  );
}