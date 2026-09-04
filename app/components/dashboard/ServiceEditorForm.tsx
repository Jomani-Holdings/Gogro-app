"use client";

import { useState } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { saveService } from "@/app/dashboard/admin/cms-actions";
import { RichTextEditor } from "@/app/components/dashboard/RichTextEditor";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type ServiceData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  features: string[];
  detail_content: JSONContent | null;
  sort_order: number;
  status: string;
};

export function ServiceEditorForm({
  service,
  isNew,
}: {
  service: ServiceData | null;
  isNew: boolean;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [iconName, setIconName] = useState(service?.icon_name ?? "wrench");
  const [features, setFeatures] = useState((service?.features ?? []).join("\n"));
  const [sortOrder, setSortOrder] = useState(service?.sort_order ?? 0);
  const [status, setStatus] = useState(service?.status ?? "published");
  const [content, setContent] = useState<JSONContent | null>(
    service?.detail_content ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("id", isNew ? "new" : (service?.id ?? "new"));
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("icon_name", iconName);
    formData.append("features", features);
    formData.append("sort_order", String(sortOrder));
    formData.append("status", status);
    formData.append("detail_content", JSON.stringify(content));

    try {
      await saveService(formData);
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

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={inputClass}
            required
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

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="icon_name" className={labelClass}>
            Icon
          </label>
          <select
            id="icon_name"
            value={iconName}
            onChange={(event) => setIconName(event.target.value)}
            className={inputClass}
          >
            <option value="fuel">Fuel</option>
            <option value="car">Car</option>
            <option value="users">Users</option>
            <option value="wrench">Wrench</option>
          </select>
        </div>
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
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClass}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="features" className={labelClass}>
          Features (one per line)
        </label>
        <textarea
          id="features"
          rows={4}
          value={features}
          onChange={(event) => setFeatures(event.target.value)}
          className={inputClass}
          placeholder={"Weekly payment cycles\nNo upfront fuel costs"}
        />
      </div>

      <div>
        <span className={labelClass}>Detail Content</span>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save service"}
        </button>
        <Link
          href="/dashboard/admin/services"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
