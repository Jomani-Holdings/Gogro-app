"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveGalleryImage, MAX_GALLERY_FILE_SIZE } from "@/app/dashboard/admin/gallery/actions";
import { mediaUrl } from "@/lib/media";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type GalleryData = {
  id: string;
  storage_path: string;
  caption: string | null;
  alt_text: string | null;
  description: string | null;
  sort_order: number;
  active: boolean;
};

export function GalleryForm({
  image,
  isNew,
}: {
  image: GalleryData | null;
  isNew: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [caption, setCaption] = useState(image?.caption ?? "");
  const [altText, setAltText] = useState(image?.alt_text ?? "");
  const [description, setDescription] = useState(image?.description ?? "");
  const [sortOrder, setSortOrder] = useState(image?.sort_order ?? 0);
  const [active, setActive] = useState(image?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPreview = file
    ? URL.createObjectURL(file)
    : image?.storage_path
      ? mediaUrl(image.storage_path)
      : null;

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    if (selected) {
      if (selected.size > MAX_GALLERY_FILE_SIZE) {
        setFileError("Image is larger than the 5MB limit.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!selected.type.startsWith("image/")) {
        setFileError("Please choose an image file.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setFile(selected);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (isNew && !file) {
      setError("Please choose an image to upload.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("id", isNew ? "new" : (image?.id ?? "new"));
    formData.append("caption", caption);
    formData.append("alt_text", altText);
    formData.append("description", description);
    formData.append("sort_order", String(sortOrder));
    formData.append("active", active ? "on" : "off");
    if (image?.storage_path) formData.append("existing_storage_path", image.storage_path);
    if (file) formData.append("image", file);

    try {
      await saveGalleryImage(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="image" className={labelClass}>
          Image {isNew ? "(required)" : "(leave empty to keep current image)"}
        </label>
        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-sm text-textdark file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-navy/90"
        />
        {fileError ? (
          <p className="mt-2 text-sm text-error">{fileError}</p>
        ) : null}
        {currentPreview ? (
          <div className="relative mt-4 h-48 w-full max-w-sm overflow-hidden rounded-xl border border-grey/40 bg-offwhite">
            <Image
              src={currentPreview}
              alt={altText || "Gallery image preview"}
              fill
              className="object-cover"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </div>
        ) : null}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="caption" className={labelClass}>
            Caption
          </label>
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="alt_text" className={labelClass}>
            Alt Text
          </label>
          <input
            id="alt_text"
            type="text"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <label htmlFor="sort_order" className={labelClass}>
            Sort Order
          </label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-3 pb-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-5 w-5 rounded border-grey text-orange focus:ring-orange/60"
          />
          <span className="text-sm font-semibold text-textdark">
            Active (visible on public gallery)
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save image"}
        </button>
        <Link
          href="/dashboard/admin/gallery"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}