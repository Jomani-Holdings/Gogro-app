import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { GalleryForm } from "@/app/components/dashboard/GalleryForm";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("galleries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as Record<string, unknown>;

  const image = {
    id: String(row.id),
    storage_path: String(row.storage_path),
    caption: row.caption ? String(row.caption) : null,
    alt_text: row.alt_text ? String(row.alt_text) : null,
    description: row.description ? String(row.description) : null,
    sort_order: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
  };

  return (
    <div>
      <Link
        href="/dashboard/admin/gallery"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to gallery
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit image
      </h1>

      <div className="mt-8">
        <GalleryForm image={image} isNew={false} />
      </div>
    </div>
  );
}