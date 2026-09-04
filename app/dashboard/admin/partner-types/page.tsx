import Link from "next/link";
import { getAdminPartnerTypes } from "@/lib/data/admin";

export default async function AdminPartnerTypesPage() {
  const types = await getAdminPartnerTypes();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Partner Types
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage the partner categories on your public site.
          </p>
        </div>
        <Link
          href="/dashboard/admin/partner-types/new/edit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add partner type
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {types.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No partner types yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Slug
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr
                  key={type.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {type.name}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60">
                    {type.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/partner-types/${type.id}/edit`}
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
