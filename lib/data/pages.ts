import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { PageRecord } from "@/lib/data/types";

export const FALLBACK_PAGES: PageRecord[] = [
  {
    id: "fallback-home",
    slug: "home",
    meta_title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
    meta_description:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
    hero_title: "Mobility Solutions That Move You Forward.",
    hero_subtitle:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
    status: "published",
  },
  {
    id: "fallback-about",
    slug: "about",
    meta_title: "About Us | Go Gro Mobility",
    meta_description: null,
    hero_title: "About Us",
    hero_subtitle:
      "A mobility solutions company focused on helping entrepreneurs move, operate and grow.",
    status: "published",
  },
  {
    id: "fallback-services",
    slug: "services",
    meta_title: "Our Services | Go Gro Mobility",
    meta_description: null,
    hero_title: "Our Services",
    hero_subtitle:
      "Everything you need to keep your vehicle on the road and your business growing — all in one platform.",
    status: "published",
  },
  {
    id: "fallback-partners",
    slug: "partners",
    meta_title: "Partners | Go Gro Mobility",
    meta_description: null,
    hero_title: "Partners",
    hero_subtitle:
      "Our network of partner garages keeps drivers moving across Cape Town.",
    status: "published",
  },
  {
    id: "fallback-contact",
    slug: "contact",
    meta_title: "Contact Us | Go Gro Mobility",
    meta_description: null,
    hero_title: "Contact Us",
    hero_subtitle:
      "Have a question or ready to get started? Our team is here to help.",
    status: "published",
  },
  {
    id: "fallback-how-it-works",
    slug: "how-it-works",
    meta_title: "How It Works | Go Gro Mobility",
    meta_description: null,
    hero_title: "How It Works",
    hero_subtitle: null,
    status: "published",
  },
  {
    id: "fallback-rewards",
    slug: "rewards",
    meta_title: "Driver Rewards & Benefits | Go Gro Mobility",
    meta_description: null,
    hero_title: "Driver Rewards & Benefits",
    hero_subtitle: "Good account management unlocks more.",
    status: "published",
  },
];

function mapRow(row: Record<string, unknown>): PageRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    meta_title: row.meta_title ? String(row.meta_title) : null,
    meta_description: row.meta_description
      ? String(row.meta_description)
      : null,
    hero_title: row.hero_title ? String(row.hero_title) : null,
    hero_subtitle: row.hero_subtitle ? String(row.hero_subtitle) : null,
    status: String(row.status ?? "published"),
  };
}

export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  if (!hasSupabaseConfig()) {
    return FALLBACK_PAGES.find((page) => page.slug === slug) ?? null;
  }

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_PAGES.find((page) => page.slug === slug) ?? null;
    }
    return mapRow(data as Record<string, unknown>);
  } catch {
    return FALLBACK_PAGES.find((page) => page.slug === slug) ?? null;
  }
}
