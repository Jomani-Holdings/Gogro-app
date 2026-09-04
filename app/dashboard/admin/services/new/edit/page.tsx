import Link from "next/link";
import { ServiceEditorForm } from "@/app/components/dashboard/ServiceEditorForm";

export default function NewServicePage() {
  return (
    <div>
      <Link
        href="/dashboard/admin/services"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to services
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Add service
      </h1>

      <div className="mt-8">
        <ServiceEditorForm service={null} isNew />
      </div>
    </div>
  );
}
