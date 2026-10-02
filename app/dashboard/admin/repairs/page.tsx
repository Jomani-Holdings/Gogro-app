import {
  getAdminRepairDrivers,
  getAdminDriverSearchOptions,
  getAdminGarageOptions,
  getAdminVehicles,
} from "@/lib/data/admin";
import { RepairDriversTable } from "@/app/components/dashboard/RepairDriversTable";
import { LogRepairModal } from "@/app/components/dashboard/LogRepairModal";

export default async function AdminRepairsPage() {
  const [repairDrivers, searchDrivers, garages, vehicles] = await Promise.all([
    getAdminRepairDrivers(),
    getAdminDriverSearchOptions(),
    getAdminGarageOptions(),
    getAdminVehicles(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Repairs
          </h1>
          <p className="text-textdark/60 mt-1">
            Track driver repair debt, lifetime history and log new repairs.
          </p>
        </div>
        <LogRepairModal
          drivers={searchDrivers}
          vehicles={vehicles}
          garages={garages}
        />
      </div>

      <div className="mt-8">
        <RepairDriversTable drivers={repairDrivers} />
      </div>
    </div>
  );
}