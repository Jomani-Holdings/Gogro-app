import Link from "next/link";
import { getAdminVehicles } from "@/lib/data/admin";
import { VehiclesTable } from "@/app/components/dashboard/VehiclesTable";

export default async function AdminVehiclesPage() {
  const vehicles = await getAdminVehicles();
  const fleetVehicles = vehicles.filter((v) => v.ownership_type !== "own");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Vehicles
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage the fleet of vehicles Go Gro actively manages or rents out.
          </p>
        </div>
        <Link
          href="/dashboard/admin/vehicles/new"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add vehicle
        </Link>
      </div>

      <div className="mt-8">
        <VehiclesTable vehicles={fleetVehicles} />
      </div>
    </div>
  );
}