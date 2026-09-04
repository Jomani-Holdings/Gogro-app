import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { Service } from "@/lib/data/types";
import { FALLBACK_SERVICE_DETAILS } from "@/lib/data/service-details";

// Static fallback used when the `services` table is unavailable so the site
// still renders before the CMS is seeded.
export const FALLBACK_SERVICES: Service[] = [
  {
    id: "fallback-fuel-credit",
    slug: "fuel-credit",
    name: "Fuel Credit",
    description: "Fuel today. Keep moving. Keep earning.",
    icon_name: "fuel",
    features: [
      "E-hailing and delivery drivers",
      "Weekly repayment cycle",
      "Growing partner fuel network",
    ],
    detail_content: FALLBACK_SERVICE_DETAILS["fuel-credit"],
    sort_order: 1,
    status: "published",
  },
  {
    id: "fallback-vehicle-rental",
    slug: "vehicle-rental",
    name: "Vehicle Rental",
    description: "Get a car. Get on the road. Start earning.",
    icon_name: "car",
    features: [
      "Reliable e-hailing vehicles",
      "Simple four-step process",
      "Built for e-hailing drivers",
    ],
    detail_content: FALLBACK_SERVICE_DETAILS["vehicle-rental"],
    sort_order: 2,
    status: "published",
  },
  {
    id: "fallback-vehicle-management",
    slug: "vehicle-management",
    name: "Vehicle Management",
    description: "Your vehicle. Managed. Earning.",
    icon_name: "users",
    features: [
      "Driver sourcing and screening",
      "Weekly rental collection",
      "Maintenance and admin support",
    ],
    detail_content: FALLBACK_SERVICE_DETAILS["vehicle-management"],
    sort_order: 3,
    status: "published",
  },
  {
    id: "fallback-vehicle-repairs",
    slug: "vehicle-repairs",
    name: "Vehicle Repairs",
    description:
      "Request a repair and we'll connect you with trusted mechanics to keep you moving.",
    icon_name: "wrench",
    features: [
      "Trusted mechanics",
      "Minimise downtime",
      "Quality-assured work",
    ],
    detail_content: null,
    sort_order: 4,
    status: "published",
  },
];

function mapRow(row: Record<string, unknown>): Service {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    features: Array.isArray(row.features)
      ? row.features.map(String)
      : [],
    detail_content: (row.detail_content as Service["detail_content"]) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    status: String(row.status ?? "published"),
  };
}

export async function getServices(): Promise<Service[]> {
  if (!hasSupabaseConfig()) return FALLBACK_SERVICES;

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("sort_order");

    if (error || !data || data.length === 0) return FALLBACK_SERVICES;
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function getServiceBySlug(
  slug: string
): Promise<Service | null> {
  if (!hasSupabaseConfig()) {
    return FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null;
  }

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null;
    }
    return mapRow(data as Record<string, unknown>);
  } catch {
    return FALLBACK_SERVICES.find((service) => service.slug === slug) ?? null;
  }
}
