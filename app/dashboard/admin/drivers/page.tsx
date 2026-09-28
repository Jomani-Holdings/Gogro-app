import {
  getAdminDrivers,
  getAdminGarageOptions,
  getAdminRepairDrivers,
  getAdminDriverSearchOptions,
  getAdminVehicles,
} from "@/lib/data/admin";
import { DriverSectionTabs } from "@/app/components/dashboard/DriverSectionTabs";

export default async function AdminDriversPage() {
  const [drivers, garages, repairDrivers, searchDrivers, vehicles] =
    await Promise.all([
      getAdminDrivers(),
      getAdminGarageOptions(),
      getAdminRepairDrivers(),
      getAdminDriverSearchOptions(),
      getAdminVehicles(),
    ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Drivers</h1>
      <p className="text-textdark/60 mt-1">
        Manage driver accounts, operational details and status.
      </p>

      <div className="mt-8">
        <DriverSectionTabs
          drivers={drivers}
          garages={garages}
          repairDrivers={repairDrivers}
          searchDrivers={searchDrivers}
          vehicles={vehicles}
        />
      </div>
    </div>
  );
}