import Link from "next/link";
import { getAdminGarageOptions } from "@/lib/data/admin";
import { DriverForm } from "@/app/components/dashboard/DriverForm";

export default async function NewDriverPage() {
  const garages = await getAdminGarageOptions();

  return (
    <div>
      <Link
        href="/dashboard/admin/drivers"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to drivers
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Add driver
      </h1>

      <div className="mt-8">
        <DriverForm driver={null} isNew garages={garages} />
      </div>
    </div>
  );
}