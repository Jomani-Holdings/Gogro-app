import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { Garage } from "@/lib/data/types";

type FallbackGarage = Omit<
  Garage,
  "active" | "sort_order" | "image_path" | "description"
> & {
  partner_type_slug: string;
};

export const FALLBACK_GARAGES: FallbackGarage[] = [
  { id: "astron-marlborough", name: "Astron Energy Marlborough Street", partner_type_id: null, partner_type_slug: "fuel", address: "22 Marlborough Street, Kraaifontein 7579", phone: null, latitude: null, longitude: null },
  { id: "astron-goodwood", name: "Astron Energy Goodwood", partner_type_id: null, partner_type_slug: "fuel", address: "31 Voortrekker Road, Goodwood, 7460", phone: null, latitude: null, longitude: null },
  { id: "bp-paarl", name: "BP Paarl", partner_type_id: null, partner_type_slug: "fuel", address: "Cnr Jan Van Riebeeck Drive & Huguenot", phone: null, latitude: null, longitude: null },
  { id: "astron-klip-road", name: "Astron Energy Klip Road", partner_type_id: null, partner_type_slug: "fuel", address: "38 Klip Road, Grassy Park", phone: null, latitude: null, longitude: null },
  { id: "astron-blue-downs-way", name: "Astron Energy Blue Down Way", partner_type_id: null, partner_type_slug: "fuel", address: "1 Blue Downs Way, Blue Downs, Cape Town 8530", phone: null, latitude: null, longitude: null },
  { id: "astron-greenways", name: "Astron Energy Greenways", partner_type_id: null, partner_type_slug: "fuel", address: "82 Gordon's Bay Drive, Strand", phone: null, latitude: null, longitude: null },
  { id: "astron-mowbray", name: "Astron Energy Mowbray", partner_type_id: null, partner_type_slug: "fuel", address: "80 Durban Road, Mowbray, 7700", phone: null, latitude: null, longitude: null },
  { id: "cl-automotive", name: "CL Automotive Services", partner_type_id: null, partner_type_slug: "service", address: "172 Wapnick Street, Peerless Park West, Cape Town, 7570", phone: null, latitude: null, longitude: null },
  { id: "fixxr", name: "Fixxr", partner_type_id: null, partner_type_slug: "service", address: "Address available on request", phone: null, latitude: null, longitude: null },
  { id: "autoworx-performance", name: "Autoworx Performance", partner_type_id: null, partner_type_slug: "service", address: "30 Balfour Road, Windsor Park, Cape Town, 7570", phone: null, latitude: null, longitude: null },
  { id: "best-drive-brackenfell", name: "Best drive Brackenfell", partner_type_id: null, partner_type_slug: "service", address: "3 Jeanette Street, Brackenfell South, Cape Town 7560", phone: null, latitude: null, longitude: null },
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
    image_path: null,
    description: null,
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
    image_path: row.image_path ? String(row.image_path) : null,
    description: row.description ? String(row.description) : null,
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
