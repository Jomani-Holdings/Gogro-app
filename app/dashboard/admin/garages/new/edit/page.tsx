import Link from "next/link";
import { getAdminPartnerTypes } from "@/lib/data/admin";
import { GarageForm } from "@/app/components/dashboard/GarageForm";

export default async function NewGaragePage() {
  const types = await getAdminPartnerTypes();

  return (
    <div>
      <Link
        href="/dashboard/admin/garages"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to garages
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Add garage
      </h1>

      <div className="mt-8">
        <GarageForm garage={null} types={types} isNew />
      </div>
    </div>
  );
}
