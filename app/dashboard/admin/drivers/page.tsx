import { getAdminDrivers } from "@/lib/data/admin";
import { DriversTable } from "@/app/components/dashboard/DriversTable";

export default async function AdminDriversPage() {
  const drivers = await getAdminDrivers();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Drivers</h1>
      <p className="text-textdark/60 mt-1">
        Manage driver accounts and suspend or activate access.
      </p>

      <div className="mt-8">
        <DriversTable drivers={drivers} />
      </div>
    </div>
  );
}
