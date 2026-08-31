import { createClient } from "@/lib/supabase/client";

export type Garage = {
  id: string;
  name: string;
  type: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
};

// MOCK fallback data — used when the `garages` table is empty/unavailable so
// the partner UI can still be previewed. Replace with real rows once seeded.
export const MOCK_GARAGES: Garage[] = [
  { id: "kraaifontein-astron", name: "Kraaifontein Astron", type: "fuel", address: "1 Brighton Road, Kraaifontein, Cape Town, 7570", phone: "021 555 0101", latitude: -33.848, longitude: 18.7176 },
  { id: "goodwood-astron", name: "Goodwood Astron", type: "fuel", address: "42 Voortrekker Road, Goodwood, Cape Town, 7460", phone: "021 555 0102", latitude: -33.9106, longitude: 18.5532 },
  { id: "paarl-bp", name: "Paarl BP", type: "fuel", address: "18 Main Road, Paarl, 7646", phone: "021 555 0103", latitude: -33.7342, longitude: 18.9621 },
  { id: "atlantis-astron", name: "Atlantis Astron", type: "fuel", address: "7 Silvermine Street, Atlantis, Cape Town, 7349", phone: "021 555 0104", latitude: -33.5669, longitude: 18.4831 },
  { id: "grassy-park-astron", name: "Grassy Park Astron", type: "fuel", address: "3 Klip Road, Grassy Park, Cape Town, 7941", phone: "021 555 0105", latitude: -34.0486, longitude: 18.4948 },
  { id: "blue-downs-astron", name: "Blue Downs Astron", type: "fuel", address: "22 Hindle Road, Blue Downs, Cape Town, 7100", phone: "021 555 0106", latitude: -34.0112, longitude: 18.7005 },
  { id: "strand-astron", name: "Strand Astron", type: "fuel", address: "11 Beach Road, Strand, Cape Town, 7140", phone: "021 555 0107", latitude: -34.1166, longitude: 18.8272 },
  { id: "mowbray-astron", name: "Mowbray Astron", type: "fuel", address: "15 Main Road, Mowbray, Cape Town, 7700", phone: "021 555 0108", latitude: -33.947, longitude: 18.476 },
  { id: "cape-town-service-centre", name: "Cape Town Service Centre", type: "service", address: "4 Buitenkant Street, Cape Town, 8001", phone: "021 555 0201", latitude: -33.9258, longitude: 18.4232 },
  { id: "northern-suburbs-auto-repairs", name: "Northern Suburbs Auto Repairs", type: "service", address: "9 Durban Road, Bellville, Cape Town, 7530", phone: "021 555 0202", latitude: -33.896, longitude: 18.6422 },
];

export async function fetchGarages(type?: string): Promise<Garage[]> {
  const supabase = createClient();

  let query = supabase
    .from("garages")
    .select("id, name, type, address, phone, latitude, longitude")
    .eq("active", true)
    .order("sort_order");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    const fallback = type
      ? MOCK_GARAGES.filter((garage) => garage.type === type)
      : MOCK_GARAGES;
    return fallback;
  }

  return data as Garage[];
}
