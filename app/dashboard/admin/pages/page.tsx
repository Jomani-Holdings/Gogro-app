import Link from "next/link";
import { getAdminPages } from "@/lib/data/admin";

export default async function AdminPagesListPage() {
  const pages = await getAdminPages();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">Pages</h1>
          <p className="text-textdark/60 mt-1">
            Edit SEO metadata and hero text for each page.
          </p>
        </div>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey/40 text-left text-textdark/60">
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Meta Title</th>
              <th className="hidden lg:table-cell px-4 py-3 font-medium">
                Hero Title
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr
                key={page.id}
                className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
              >
                <td className="px-4 py-3 font-medium text-textdark">
                  {page.slug === "home" ? "/" : `/${page.slug}`}
                </td>
                <td className="px-4 py-3 text-textdark/80 max-w-xs truncate">
                  {page.meta_title ?? "—"}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                  {page.hero_title ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      page.status === "published"
                        ? "bg-success/10 text-success"
                        : "bg-grey/40 text-textdark"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/admin/pages/${encodeURIComponent(page.slug)}/edit`}
                    className="text-navy font-semibold hover:text-orange"
                  >
                    Edit &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
