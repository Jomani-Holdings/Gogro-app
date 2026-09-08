import { requireUser } from "@/lib/auth";
import { getGaragesByTypeSlug } from "@/lib/data/garages";
import { GarageLocator } from "@/app/components/dashboard/GarageLocator";

export default async function DriverGaragesPage() {
  await requireUser();
  const garages = await getGaragesByTypeSlug();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Find a Garage
      </h1>
      <p className="text-textdark/60 mt-1">
        Locate Go Gro partner garages near you.
      </p>

      <div className="mt-8">
        <GarageLocator garages={garages} />
      </div>
    </div>
  );
}
