import Link from "next/link";
import Image from "next/image";
import { getAdminGarages, getAdminPartnerTypes } from "@/lib/data/admin";
import { DeleteGarageButton } from "@/app/components/dashboard/DeleteGarageButton";
import { mediaUrl } from "@/lib/media";

export default async function AdminGaragesPage() {
  const [garages, types] = await Promise.all([
    getAdminGarages(),
    getAdminPartnerTypes(),
  ]);

  const typeName = (id: string | null) =>
    types.find((type) => type.id === id)?.name ?? "—";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Garages
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage your partner garages and their locations.
          </p>
        </div>
        <Link
          href="/dashboard/admin/garages/new/edit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add garage
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {garages.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No garages yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Type
                </th>
                <th className="hidden lg:table-cell px-4 py-3 font-medium">
                  Address
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {garages.map((garage) => (
                <tr
                  key={garage.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-grey/30 bg-offwhite">
                      {garage.image_path ? (
                        <Image
                          src={mediaUrl(garage.image_path)}
                          alt={garage.alt_text ?? `${garage.name} image`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-textdark/40 text-xs">
                          No image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-textdark">
                    {garage.name}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                    {typeName(garage.partner_type_id)}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-textdark/60 max-w-xs truncate">
                    {garage.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        garage.active
                          ? "bg-success/10 text-success"
                          : "bg-grey/40 text-textdark"
                      }`}
                    >
                      {garage.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/admin/garages/${garage.id}/edit`}
                        className="text-navy font-semibold hover:text-orange"
                      >
                        Edit
                      </Link>
                      <DeleteGarageButton id={garage.id} name={garage.name} />
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
