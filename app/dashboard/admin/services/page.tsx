import Link from "next/link";
import { getAdminServices } from "@/lib/data/admin";
import { DeleteServiceButton } from "@/app/components/dashboard/DeleteButtons";

export default async function AdminServicesListPage() {
  const services = await getAdminServices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Services
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage the services shown on your public site.
          </p>
        </div>
        <Link
          href="/dashboard/admin/services/new/edit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add service
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {services.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No services yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Slug
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {service.name}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60">
                    {service.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        service.status === "published"
                          ? "bg-success/10 text-success"
                          : "bg-grey/40 text-textdark"
                      }`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/admin/services/${service.id}/edit`}
                        className="text-navy font-semibold hover:text-orange"
                      >
                        Edit
                      </Link>
                      <DeleteServiceButton id={service.id} />
                    </div>
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
