import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminPartnerTypes } from "@/lib/data/admin";
import { GarageForm } from "@/app/components/dashboard/GarageForm";

export default async function EditGaragePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data, error }, types] = await Promise.all([
    admin.from("garages").select("*").eq("id", id).maybeSingle(),
    getAdminPartnerTypes(),
  ]);

  if (error || !data) notFound();

  const row = data as Record<string, unknown>;

  const garage = {
    id: String(row.id),
    name: String(row.name),
    address: row.address ? String(row.address) : null,
    phone: row.phone ? String(row.phone) : null,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    partner_type_id: row.partner_type_id ? String(row.partner_type_id) : null,
    active: Boolean(row.active),
    sort_order: Number(row.sort_order ?? 0),
  };

  return (
    <div>
      <Link
        href="/dashboard/admin/garages"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to garages
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit garage — {garage.name}
      </h1>

      <div className="mt-8">
        <GarageForm garage={garage} types={types} isNew={false} />
      </div>
    </div>
  );
}
