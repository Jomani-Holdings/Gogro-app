import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SeoForm } from "@/app/components/dashboard/SeoForm";

export default async function EditSeoPage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const routePath = decodeURIComponent(route);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("seo_meta")
    .select("*")
    .eq("route_path", routePath)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as Record<string, unknown>;

  const seo = {
    route_path: String(row.route_path),
    page_title: row.page_title ? String(row.page_title) : null,
    meta_title: row.meta_title ? String(row.meta_title) : null,
    meta_description: row.meta_description ? String(row.meta_description) : null,
    og_title: row.og_title ? String(row.og_title) : null,
    og_description: row.og_description ? String(row.og_description) : null,
    og_image_url: row.og_image_url ? String(row.og_image_url) : null,
    canonical_path: row.canonical_path ? String(row.canonical_path) : null,
    noindex: Boolean(row.noindex),
  };

  return (
    <div>
      <Link
        href="/dashboard/admin/seo"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to SEO
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit SEO — {routePath}
      </h1>

      <div className="mt-8">
        <SeoForm seo={seo} />
      </div>
    </div>
  );
}