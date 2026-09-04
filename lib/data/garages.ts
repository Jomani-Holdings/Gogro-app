import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { Garage } from "@/lib/data/types";

type FallbackGarage = Omit<Garage, "active" | "sort_order"> & {
  partner_type_slug: string;
};

export const FALLBACK_GARAGES: FallbackGarage[] = [
  { id: "kraaifontein-astron", name: "Kraaifontein Astron", partner_type_id: null, partner_type_slug: "fuel", address: "1 Brighton Road, Kraaifontein, Cape Town, 7570", phone: "021 555 0101", latitude: -33.848, longitude: 18.7176 },
  { id: "goodwood-astron", name: "Goodwood Astron", partner_type_id: null, partner_type_slug: "fuel", address: "42 Voortrekker Road, Goodwood, Cape Town, 7460", phone: "021 555 0102", latitude: -33.9106, longitude: 18.5532 },
  { id: "paarl-bp", name: "Paarl BP", partner_type_id: null, partner_type_slug: "fuel", address: "18 Main Road, Paarl, 7646", phone: "021 555 0103", latitude: -33.7342, longitude: 18.9621 },
  { id: "atlantis-astron", name: "Atlantis Astron", partner_type_id: null, partner_type_slug: "fuel", address: "7 Silvermine Street, Atlantis, Cape Town, 7349", phone: "021 555 0104", latitude: -33.5669, longitude: 18.4831 },
  { id: "grassy-park-astron", name: "Grassy Park Astron", partner_type_id: null, partner_type_slug: "fuel", address: "3 Klip Road, Grassy Park, Cape Town, 7941", phone: "021 555 0105", latitude: -34.0486, longitude: 18.4948 },
  { id: "blue-downs-astron", name: "Blue Downs Astron", partner_type_id: null, partner_type_slug: "fuel", address: "22 Hindle Road, Blue Downs, Cape Town, 7100", phone: "021 555 0106", latitude: -34.0112, longitude: 18.7005 },
  { id: "strand-astron", name: "Strand Astron", partner_type_id: null, partner_type_slug: "fuel", address: "11 Beach Road, Strand, Cape Town, 7140", phone: "021 555 0107", latitude: -34.1166, longitude: 18.8272 },
  { id: "mowbray-astron", name: "Mowbray Astron", partner_type_id: null, partner_type_slug: "fuel", address: "15 Main Road, Mowbray, Cape Town, 7700", phone: "021 555 0108", latitude: -33.947, longitude: 18.476 },
  { id: "cape-town-service-centre", name: "Cape Town Service Centre", partner_type_id: null, partner_type_slug: "service", address: "4 Buitenkant Street, Cape Town, 8001", phone: "021 555 0201", latitude: -33.9258, longitude: 18.4232 },
  { id: "northern-suburbs-auto-repairs", name: "Northern Suburbs Auto Repairs", partner_type_id: null, partner_type_slug: "service", address: "9 Durban Road, Bellville, Cape Town, 7530", phone: "021 555 0202", latitude: -33.896, longitude: 18.6422 },
];

function fallbackForType(slug?: string): Garage[] {
  const filtered = slug
    ? FALLBACK_GARAGES.filter((garage) => garage.partner_type_slug === slug)
    : FALLBACK_GARAGES;
  return filtered.map((garage) => ({
    id: garage.id,
    name: garage.name,
    address: garage.address,
    phone: garage.phone,
    latitude: garage.latitude,
    longitude: garage.longitude,
    partner_type_id: garage.partner_type_id,
    active: true,
    sort_order: 0,
  }));
}

function mapRow(row: Record<string, unknown>): Garage {
  return {
    id: String(row.id),
    name: String(row.name),
    address: row.address ? String(row.address) : null,
    phone: row.phone ? String(row.phone) : null,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    partner_type_id: row.partner_type_id ? String(row.partner_type_id) : null,
    active: Boolean(row.active),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function getGaragesByTypeSlug(
  slug?: string
): Promise<Garage[]> {
  if (!hasSupabaseConfig()) return fallbackForType(slug);

  try {
    const supabase = createReadonlyClient();

    if (!slug) {
      const { data, error } = await supabase
        .from("garages")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error || !data || data.length === 0) return fallbackForType(slug);
      return (data as Record<string, unknown>[]).map(mapRow);
    }

    const { data: typeData } = await supabase
      .from("partner_types")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!typeData) return fallbackForType(slug);

    const { data, error } = await supabase
      .from("garages")
      .select("*")
      .eq("active", true)
      .eq("partner_type_id", typeData.id)
      .order("sort_order");

    if (error || !data || data.length === 0) return fallbackForType(slug);
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return fallbackForType(slug);
  }
}
