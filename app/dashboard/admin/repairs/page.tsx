import {
  getAdminRepairDrivers,
  getAdminDriverSearchOptions,
  getAdminGarageOptions,
  getAdminVehicleOptions,
} from "@/lib/data/admin";
import { RepairDriversTable } from "@/app/components/dashboard/RepairDriversTable";
import { LogRepairModal } from "@/app/components/dashboard/LogRepairModal";

export default async function AdminRepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const direction = params.dir === "prev" ? "prev" : "next";
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const [repairPage, searchDrivers, garages, vehicles] = await Promise.all([
    getAdminRepairDrivers({ cursor, direction, query, status }),
    getAdminDriverSearchOptions(),
    getAdminGarageOptions(),
    getAdminVehicleOptions(),
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
        <RepairDriversTable
          drivers={repairPage.rows}
          pageInfo={repairPage}
          filters={{ query, status }}
        />
      </div>
    </div>
  );
}
