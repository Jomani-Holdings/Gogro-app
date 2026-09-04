import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminEmailTemplate } from "@/lib/data/admin";
import { EmailTemplateForm } from "@/app/components/dashboard/EmailTemplateForm";

export default async function EditEmailTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getAdminEmailTemplate(id);

  if (!template) notFound();

  return (
    <div>
      <Link
        href="/dashboard/admin/email-templates"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to email templates
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit template — {template.name}
      </h1>

      <div className="mt-8">
        <EmailTemplateForm template={template} />
      </div>
    </div>
  );
}
