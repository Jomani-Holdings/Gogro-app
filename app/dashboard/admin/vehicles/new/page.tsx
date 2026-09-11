import Link from "next/link";
import { getAdminVehicleDriverOptions } from "@/lib/data/admin";
import { VehicleForm } from "@/app/components/dashboard/VehicleForm";

export default async function NewVehiclePage() {
  const drivers = await getAdminVehicleDriverOptions();

  return (
    <div>
      <Link
        href="/dashboard/admin/vehicles"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to vehicles
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Add vehicle
      </h1>

      <div className="mt-8">
        <VehicleForm vehicle={null} drivers={drivers} isNew />
      </div>
    </div>
  );
}