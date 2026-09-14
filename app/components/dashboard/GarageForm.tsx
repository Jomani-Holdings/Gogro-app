"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  saveGarage,
} from "@/app/dashboard/admin/cms-actions";
import { mediaUrl, MAX_GARAGE_IMAGE_SIZE } from "@/lib/media";
import type { PartnerType } from "@/lib/data/types";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type GarageData = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  partner_type_id: string | null;
  active: boolean;
  sort_order: number;
  image_path: string | null;
  description: string | null;
};

export function GarageForm({
  garage,
  types,
  isNew,
}: {
  garage: GarageData | null;
  types: PartnerType[];
  isNew: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingImagePath = garage?.image_path ?? null;
  const currentPreview = file
    ? URL.createObjectURL(file)
    : !removeImage && existingImagePath
      ? mediaUrl(existingImagePath)
      : null;

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    if (selected) {
      if (selected.size > MAX_GARAGE_IMAGE_SIZE) {
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

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    if (existingImagePath) formData.append("existing_image_path", existingImagePath);
    if (removeImage) formData.append("remove_image", "on");
    if (file) formData.append("image", file);

    try {
      await saveGarage(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-grey/40 rounded-2xl p-6 max-w-xl space-y-5">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={garage?.name ?? ""}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="partner_type_id" className={labelClass}>
          Partner Type
        </label>
        <select
          id="partner_type_id"
          name="partner_type_id"
          defaultValue={garage?.partner_type_id ?? types[0]?.id ?? ""}
          className={inputClass}
          required
        >
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={garage?.address ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={garage?.phone ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="image" className={labelClass}>
          Image {isNew ? "(optional)" : "(leave empty to keep current image)"}
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
          <div className="relative mt-4 aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-grey/40 bg-offwhite">
            <Image
              src={currentPreview}
              alt={`${garage?.name ?? "Garage"} image preview`}
              fill
              className="object-cover"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </div>
        ) : (
          <div className="mt-4 aspect-video w-full max-w-sm rounded-xl border border-dashed border-grey/60 bg-offwhite flex items-center justify-center text-sm text-textdark/50">
            No image
          </div>
        )}
        {existingImagePath && !file ? (
          <label className="flex items-center gap-2 mt-3 text-sm text-textdark">
            <input
              type="checkbox"
              name="remove_image"
              checked={removeImage}
              onChange={(event) => setRemoveImage(event.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            Remove current image
          </label>
        ) : null}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={garage?.description ?? ""}
          placeholder="Services, accreditation or any other notes about this partner."
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="latitude" className={labelClass}>
            Latitude
          </label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            defaultValue={garage?.latitude ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="longitude" className={labelClass}>
            Longitude
          </label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            defaultValue={garage?.longitude ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <label htmlFor="sort_order" className={labelClass}>
            Sort Order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={garage?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-textdark pb-3">
          <input
            type="checkbox"
            name="active"
            defaultChecked={garage?.active ?? true}
            className="h-4 w-4 accent-orange"
          />
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save garage"}
        </button>
        <Link
          href="/dashboard/admin/garages"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}