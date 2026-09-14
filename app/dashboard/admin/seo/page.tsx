import Link from "next/link";
import { getAdminSeoMeta } from "@/lib/data/admin";
import { SyncRoutesButton } from "@/app/components/dashboard/SyncRoutesButton";

export default async function AdminSeoListPage() {
  const seoRows = await getAdminSeoMeta();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">SEO</h1>
          <p className="text-textdark/60 mt-1">
            Manage search engine metadata for every page on your site.
          </p>
        </div>
        <SyncRoutesButton />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {seoRows.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No SEO routes yet. Click “Sync Routes” to seed all pages.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="hidden lg:table-cell px-4 py-3 font-medium">
                  Meta Title
                </th>
                <th className="px-4 py-3 font-medium">Indexing</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {seoRows.map((seo) => (
                <tr
                  key={seo.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {seo.route_path}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-textdark/80 max-w-xs truncate">
                    {seo.meta_title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        seo.noindex
                          ? "bg-grey/40 text-textdark"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {seo.noindex ? "Noindex" : "Indexable"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/seo/${encodeURIComponent(seo.route_path)}/edit`}
                      className="text-navy font-semibold hover:text-orange"
                    >
                      Edit &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}