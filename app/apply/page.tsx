import { PageHero } from "@/app/components/PageHero";
import {
  ExpressJoinForm,
  type ServiceOption,
} from "@/app/components/apply/ExpressJoinForm";
import { getServices } from "@/lib/data/services";

const FALLBACK_SERVICES: ServiceOption[] = [
  { id: "fallback-fuel-credit", name: "Fuel Credit" },
  { id: "fallback-vehicle-rental", name: "Vehicle Rental" },
  { id: "fallback-vehicle-management", name: "Vehicle Management" },
];

async function getServiceOptions(): Promise<ServiceOption[]> {
  try {
    const services = await getServices();
    if (services.length === 0) return FALLBACK_SERVICES;
    return services.map((s) => ({ id: s.id, name: s.name }));
  } catch {
    return FALLBACK_SERVICES;
  }
}

export default async function ApplyPage() {
  const services = await getServiceOptions();

  return (
    <>
      <PageHero
        title="Join Go Gro"
        subtitle="Tell us a little about yourself and we'll be in touch with the right next steps."
      />

      <ExpressJoinForm services={services} />
    </>
  );
}
