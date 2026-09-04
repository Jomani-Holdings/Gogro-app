import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerTypeForm } from "@/app/components/dashboard/PartnerTypeForm";

export default async function EditPartnerTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("partner_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as Record<string, unknown>;

  const type = {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    sort_order: Number(row.sort_order ?? 0),
  };

  return (
    <div>
      <Link
        href="/dashboard/admin/partner-types"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to partner types
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit partner type — {type.name}
      </h1>

      <div className="mt-8">
        <PartnerTypeForm type={type} isNew={false} />
      </div>
    </div>
  );
}
