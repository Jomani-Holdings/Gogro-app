import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ServiceEditorForm } from "@/app/components/dashboard/ServiceEditorForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as Record<string, unknown>;

  const service = {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    detail_content: (row.detail_content as never) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    status: String(row.status ?? "published"),
  };

  return (
    <div>
      <Link
        href="/dashboard/admin/services"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to services
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit service — {service.name}
      </h1>

      <div className="mt-8">
        <ServiceEditorForm service={service} isNew={false} />
      </div>
    </div>
  );
}
