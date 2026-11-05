import dynamic from "next/dynamic";
import { getFuelUsageByGarage } from "@/lib/data/admin";

const FuelUsageByGarage = dynamic(() =>
  import("@/app/components/dashboard/FuelUsageByGarage").then(
    (m) => m.FuelUsageByGarage
  )
);

export async function FuelUsageByGarageContainer() {
  const data = await getFuelUsageByGarage();
  return <FuelUsageByGarage data={data} />;
}
