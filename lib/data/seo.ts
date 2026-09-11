import type { Metadata } from "next";
import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import { getServices } from "@/lib/data/services";
import type { SeoMeta } from "@/lib/data/types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gogro.co.za";

export const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/gallery",
  "/contact",
  "/how-it-works",
  "/rewards",
  "/partners",
  "/apply",
] as const;

const FALLBACK_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
    description:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
  },
  "/about": {
    title: "About Us | Go Gro Mobility",
    description:
      "Learn about Go Gro Mobility — a South African mobility company helping drivers and entrepreneurs move, operate and grow.",
  },
  "/services": {
    title: "Our Services | Go Gro Mobility",
    description:
      "Explore fuel credit, vehicle rentals, vehicle management and repairs from Go Gro Mobility.",
  },
  "/gallery": {
    title: "Gallery | Go Gro Mobility",
    description:
      "See Go Gro Mobility in action — fuel partners, vehicles, drivers and events.",
  },
  "/contact": {
    title: "Contact Us | Go Gro Mobility",
    description:
      "Get in touch with Go Gro Mobility. We are here to help drivers and mobility entrepreneurs grow.",
  },
  "/how-it-works": {
    title: "How It Works | Go Gro Mobility",
    description:
      "Learn how Go Gro Mobility fuel credit, rentals and driver support work.",
  },
  "/rewards": {
    title: "Driver Rewards | Go Gro Mobility",
    description: "Discover Go Gro driver rewards and benefits.",
  },
  "/partners": {
    title: "Partners | Go Gro Mobility",
    description:
      "Our network of partner garages and mobility service providers.",
  },
  "/apply": {
    title: "Apply Now | Go Gro Mobility",
    description:
      "Apply to join Go Gro Mobility and access fuel credit, vehicle rentals and more.",
  },
};

function mapRow(row: Record<string, unknown>): SeoMeta {
  return {
    id: String(row.id),
    route_path: String(row.route_path),
    page_title: row.page_title ? String(row.page_title) : null,
    meta_title: row.meta_title ? String(row.meta_title) : null,
    meta_description: row.meta_description ? String(row.meta_description) : null,
    og_title: row.og_title ? String(row.og_title) : null,
    og_description: row.og_description ? String(row.og_description) : null,
    og_image_url: row.og_image_url ? String(row.og_image_url) : null,
    canonical_path: row.canonical_path ? String(row.canonical_path) : null,
    noindex: Boolean(row.noindex),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getSeoMeta(routePath: string): Promise<SeoMeta | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("seo_meta")
      .select("*")
      .eq("route_path", routePath)
      .maybeSingle();

    if (error || !data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getAllSeoRoutes(): Promise<string[]> {
  const services = await getServices();
  const serviceRoutes = services.map((service) => `/services/${service.slug}`);
  return [...STATIC_ROUTES, ...serviceRoutes];
}

export async function getSitemapRoutes(): Promise<string[]> {
  if (!hasSupabaseConfig()) return getAllSeoRoutes();

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("seo_meta")
      .select("route_path, noindex")
      .eq("noindex", false);

    if (error || !data || data.length === 0) return getAllSeoRoutes();
    return (data as { route_path: string }[]).map((row) => row.route_path);
  } catch {
    return getAllSeoRoutes();
  }
}

export async function resolveMetadata(routePath: string): Promise<Metadata> {
  const [seo] = await Promise.all([getSeoMeta(routePath)]);
  const fallback = FALLBACK_METADATA[routePath];

  const title = seo?.meta_title ?? fallback?.title ?? siteTitle;
  const description = seo?.meta_description ?? fallback?.description;

  const metadata: Metadata = {
    title,
    description,
    robots: {
      index: seo ? !seo.noindex : true,
      follow: true,
    },
    alternates: {
      canonical: seo?.canonical_path || routePath,
    },
  };

  const ogTitle = seo?.og_title ?? title;
  const ogDescription = seo?.og_description ?? description;
  if (ogTitle || ogDescription || seo?.og_image_url) {
    metadata.openGraph = {
      title: ogTitle ?? undefined,
      description: ogDescription ?? undefined,
      siteName: "Go Gro Mobility",
      images: seo?.og_image_url ? [seo.og_image_url] : undefined,
    };
  }

  return metadata;
}

export const siteTitle = "Go Gro Mobility";