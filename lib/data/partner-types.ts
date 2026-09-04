import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { PartnerType } from "@/lib/data/types";

export const FALLBACK_PARTNER_TYPES: PartnerType[] = [
  {
    id: "fallback-fuel",
    slug: "fuel",
    name: "Fuel Partners",
    description: "Garages where you can access fuel credit.",
    icon_name: "fuel",
    sort_order: 1,
  },
  {
    id: "fallback-service",
    slug: "service",
    name: "Service Partners",
    description: "Garages offering vehicle maintenance and repairs.",
    icon_name: "wrench",
    sort_order: 2,
  },
];

function mapRow(row: Record<string, unknown>): PartnerType {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function getPartnerTypes(): Promise<PartnerType[]> {
  if (!hasSupabaseConfig()) return FALLBACK_PARTNER_TYPES;

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("partner_types")
      .select("*")
      .order("sort_order");

    if (error || !data || data.length === 0) return FALLBACK_PARTNER_TYPES;
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return FALLBACK_PARTNER_TYPES;
  }
}

export async function getPartnerTypeBySlug(
  slug: string
): Promise<PartnerType | null> {
  if (!hasSupabaseConfig()) {
    return (
      FALLBACK_PARTNER_TYPES.find((type) => type.slug === slug) ?? null
    );
  }

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("partner_types")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_PARTNER_TYPES.find((type) => type.slug === slug) ?? null;
    }
    return mapRow(data as Record<string, unknown>);
  } catch {
    return FALLBACK_PARTNER_TYPES.find((type) => type.slug === slug) ?? null;
  }
}
