import Link from "next/link";
import { GalleryForm } from "@/app/components/dashboard/GalleryForm";

export default function NewGalleryImagePage() {
  return (
    <div>
      <Link
        href="/dashboard/admin/gallery"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to gallery
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-textdark mt-4">
        Upload image
      </h1>

      <div className="mt-8">
        <GalleryForm image={null} isNew />
      </div>
    </div>
  );
}