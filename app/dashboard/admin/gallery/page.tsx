import Link from "next/link";
import Image from "next/image";
import { getAdminGalleryImages } from "@/lib/data/admin";
import { GalleryImageActions } from "@/app/components/dashboard/GalleryImageActions";
import { mediaUrl } from "@/lib/media";

export default async function AdminGalleryListPage() {
  const images = await getAdminGalleryImages();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Gallery
          </h1>
          <p className="text-textdark/60 mt-1">
            Manage the images shown on the public gallery page.
          </p>
        </div>
        <Link
          href="/dashboard/admin/gallery/new"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Upload image
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {images.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No gallery images yet. Upload your first image to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Caption</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Alt Text
                </th>
                <th className="hidden lg:table-cell px-4 py-3 font-medium">
                  Sort
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr
                  key={image.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-grey/30 bg-offwhite">
                      <Image
                        src={mediaUrl(image.storage_path)}
                        alt={image.alt_text ?? image.caption ?? image.filename}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-textdark max-w-xs truncate">
                    {image.caption ?? "—"}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60 max-w-xs truncate">
                    {image.alt_text ?? "—"}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-textdark/60">
                    {image.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        image.active
                          ? "bg-success/10 text-success"
                          : "bg-grey/40 text-textdark"
                      }`}
                    >
                      {image.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/admin/gallery/${image.id}/edit`}
                        className="text-navy font-semibold hover:text-orange"
                      >
                        Edit
                      </Link>
                      <GalleryImageActions id={image.id} />
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