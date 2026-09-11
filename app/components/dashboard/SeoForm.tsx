"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveSeoMeta } from "@/app/dashboard/admin/seo/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type SeoData = {
  route_path: string;
  page_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_path: string | null;
  noindex: boolean;
};

function scoreTitle(value: string): number {
  if (!value) return 0;
  const len = value.length;
  if (len >= 50 && len <= 60) return 100;
  if (len >= 30 && len <= 70) return 75;
  if (len > 70) return 40;
  return 50;
}

function scoreDescription(value: string): number {
  if (!value) return 0;
  const len = value.length;
  if (len >= 120 && len <= 160) return 100;
  if (len >= 70 && len <= 200) return 75;
  if (len > 200) return 40;
  return 50;
}

export function SeoForm({ seo }: { seo: SeoData | null }) {
  const [routePath, setRoutePath] = useState(seo?.route_path ?? "");
  const [pageTitle, setPageTitle] = useState(seo?.page_title ?? "");
  const [metaTitle, setMetaTitle] = useState(seo?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    seo?.meta_description ?? ""
  );
  const [ogTitle, setOgTitle] = useState(seo?.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(seo?.og_description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(seo?.og_image_url ?? "");
  const [canonicalPath, setCanonicalPath] = useState(seo?.canonical_path ?? "");
  const [noindex, setNoindex] = useState(seo?.noindex ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => {
    const weights = {
      title: 0.3,
      description: 0.3,
      og: 0.2,
      canonical: 0.1,
      noindex: 0.1,
    };
    const titleScore = scoreTitle(metaTitle);
    const descScore = scoreDescription(metaDescription);
    const ogScore =
      ogTitle && ogDescription
        ? 100
        : ogTitle || ogDescription || ogImageUrl
          ? 60
          : 20;
    const canonicalScore = canonicalPath ? 100 : 0;
    const noindexScore = noindex ? 0 : 100;

    return Math.round(
      titleScore * weights.title +
        descScore * weights.description +
        ogScore * weights.og +
        canonicalScore * weights.canonical +
        noindexScore * weights.noindex
    );
  }, [metaTitle, metaDescription, ogTitle, ogDescription, ogImageUrl, canonicalPath, noindex]);

  const scoreLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Poor";
  const scoreColor =
    score >= 80
      ? "text-success border-success/40"
      : score >= 60
        ? "text-orange border-orange/40"
        : "text-error border-error/40";

  const tips: string[] = [];
  if (!metaTitle) tips.push("Add a meta title.");
  else if (metaTitle.length < 50) tips.push("Meta title is short — aim for 50–60 characters.");
  else if (metaTitle.length > 60) tips.push("Meta title is long — keep it under 60 characters.");
  if (!metaDescription) tips.push("Add a meta description.");
  else if (metaDescription.length < 120) tips.push("Meta description is short — aim for 120–160 characters.");
  else if (metaDescription.length > 160) tips.push("Meta description is long — aim for 120–160 characters.");
  if (!ogTitle || !ogDescription || !ogImageUrl)
    tips.push("Complete Open Graph fields (title, description, image) for better social sharing.");
  if (!canonicalPath) tips.push("Set a canonical URL to prevent duplicate content issues.");
  if (noindex) tips.push("This page is set to noindex — search engines will not rank it.");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("route_path", routePath);
    formData.append("page_title", pageTitle);
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);
    formData.append("og_title", ogTitle);
    formData.append("og_description", ogDescription);
    formData.append("og_image_url", ogImageUrl);
    formData.append("canonical_path", canonicalPath);
    formData.append("noindex", noindex ? "on" : "off");

    try {
      await saveSeoMeta(formData);
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
          <label htmlFor="route_path" className={labelClass}>
            Route Path
          </label>
          <input
            id="route_path"
            type="text"
            value={routePath}
            onChange={(event) => setRoutePath(event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="page_title" className={labelClass}>
            Page Title (H1)
          </label>
          <input
            id="page_title"
            type="text"
            value={pageTitle}
            onChange={(event) => setPageTitle(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-grey/40 bg-offwhite p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-textdark">SEO Score</h3>
            <p className="text-sm text-textdark/60">
              {scoreLabel} — {score}/100
            </p>
          </div>
          <span
            className={`inline-flex items-center justify-center h-16 w-16 rounded-full border-2 text-2xl font-bold ${scoreColor}`}
          >
            {score}
          </span>
        </div>
        {tips.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-textdark/70">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-success">
            Great job — all checks are passing!
          </p>
        )}
      </div>

      <div>
        <label htmlFor="meta_title" className={labelClass}>
          Meta Title ({metaTitle.length}/60)
        </label>
        <input
          id="meta_title"
          type="text"
          value={metaTitle}
          onChange={(event) => setMetaTitle(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="meta_description" className={labelClass}>
          Meta Description ({metaDescription.length}/160)
        </label>
        <textarea
          id="meta_description"
          rows={3}
          value={metaDescription}
          onChange={(event) => setMetaDescription(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="og_title" className={labelClass}>
            Open Graph Title
          </label>
          <input
            id="og_title"
            type="text"
            value={ogTitle}
            onChange={(event) => setOgTitle(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="og_image_url" className={labelClass}>
            Open Graph Image URL
          </label>
          <input
            id="og_image_url"
            type="text"
            value={ogImageUrl}
            onChange={(event) => setOgImageUrl(event.target.value)}
            className={inputClass}
            placeholder="/api/media/gallery/my-image.jpg"
          />
        </div>
      </div>

      <div>
        <label htmlFor="og_description" className={labelClass}>
          Open Graph Description
        </label>
        <textarea
          id="og_description"
          rows={3}
          value={ogDescription}
          onChange={(event) => setOgDescription(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <label htmlFor="canonical_path" className={labelClass}>
            Canonical Path
          </label>
          <input
            id="canonical_path"
            type="text"
            value={canonicalPath}
            onChange={(event) => setCanonicalPath(event.target.value)}
            className={inputClass}
            placeholder="/about"
          />
        </div>
        <label className="flex items-center gap-3 pb-3">
          <input
            type="checkbox"
            checked={noindex}
            onChange={(event) => setNoindex(event.target.checked)}
            className="h-5 w-5 rounded border-grey text-orange focus:ring-orange/60"
          />
          <span className="text-sm font-semibold text-textdark">
            Noindex (hide from search engines)
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save SEO"}
        </button>
        <Link
          href="/dashboard/admin/seo"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}