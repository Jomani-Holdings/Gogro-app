import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFormTemplate, getAdminServices } from "@/lib/data/admin";
import { FormTemplateBuilder } from "@/app/components/dashboard/FormTemplateBuilder";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [form, services] = await Promise.all([
    getAdminFormTemplate(id),
    getAdminServices(),
  ]);

  if (!form) notFound();

  const serviceOptions = services.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div>
      <Link
        href="/dashboard/admin/forms"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to forms
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit form — {form.name}
      </h1>
      <div className="mt-8">
        <FormTemplateBuilder
          serviceOptions={serviceOptions}
          form={form}
          isNew={false}
        />
      </div>
    </div>
  );
}