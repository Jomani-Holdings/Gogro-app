import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { savePage } from "@/app/dashboard/admin/cms-actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) notFound();

  const page = data as Record<string, string | null>;

  return (
    <div>
      <Link
        href="/dashboard/admin/pages"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to pages
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Edit page — {slug === "home" ? "/" : `/${slug}`}
      </h1>

      <form action={savePage} className="bg-white border border-grey/40 rounded-2xl p-6 mt-8 max-w-2xl space-y-5">
        <input type="hidden" name="slug" value={slug} />

        <div>
          <label htmlFor="meta_title" className={labelClass}>
            Meta Title
          </label>
          <input
            id="meta_title"
            name="meta_title"
            type="text"
            defaultValue={page.meta_title ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="meta_description" className={labelClass}>
            Meta Description
          </label>
          <textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            defaultValue={page.meta_description ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="hero_title" className={labelClass}>
            Hero Title
          </label>
          <input
            id="hero_title"
            name="hero_title"
            type="text"
            defaultValue={page.hero_title ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="hero_subtitle" className={labelClass}>
            Hero Subtitle
          </label>
          <textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={3}
            defaultValue={page.hero_subtitle ?? ""}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
