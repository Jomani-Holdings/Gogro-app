"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteGalleryImage,
  bustGalleryImageCache,
} from "@/app/dashboard/admin/gallery/actions";

export function GalleryImageActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteGalleryImage(id);
        router.refresh();
      } catch {
        router.refresh();
      }
    });
  }

  function handleBustCache() {
    if (!window.confirm("Regenerate this image URL to bust the CDN cache?")) return;
    startTransition(async () => {
      try {
        await bustGalleryImageCache(id);
        router.refresh();
      } catch {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={handleBustCache}
        className="text-navy font-semibold hover:text-orange disabled:opacity-50"
        title="Regenerate image URL to destroy the cached copy"
      >
        Cache bust
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="text-error font-semibold hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}