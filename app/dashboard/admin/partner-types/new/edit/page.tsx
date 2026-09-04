import Link from "next/link";
import { PartnerTypeForm } from "@/app/components/dashboard/PartnerTypeForm";

export default function NewPartnerTypePage() {
  return (
    <div>
      <Link
        href="/dashboard/admin/partner-types"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to partner types
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Add partner type
      </h1>

      <div className="mt-8">
        <PartnerTypeForm type={null} isNew />
      </div>
    </div>
  );
}
