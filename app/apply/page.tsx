import { PageHero } from "@/app/components/PageHero";
import { ApplyForm, type GarageOption } from "@/app/components/apply/ApplyForm";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_GARAGES: GarageOption[] = [
  { id: "kraaifontein-astron", name: "Kraaifontein Astron" },
  { id: "goodwood-astron", name: "Goodwood Astron" },
  { id: "paarl-bp", name: "Paarl BP" },
  { id: "atlantis-astron", name: "Atlantis Astron" },
  { id: "grassy-park-astron", name: "Grassy Park Astron" },
  { id: "blue-downs-astron", name: "Blue Downs Astron" },
  { id: "strand-astron", name: "Strand Astron" },
  { id: "mowbray-astron", name: "Mowbray Astron" },
];

async function getGarages(): Promise<GarageOption[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return FALLBACK_GARAGES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("garages")
      .select("id, name")
      .eq("active", true)
      .order("sort_order");

    if (error || !data || data.length === 0) {
      return FALLBACK_GARAGES;
    }

    return data.map((garage) => ({ id: garage.id, name: garage.name }));
  } catch {
    return FALLBACK_GARAGES;
  }
}

export default async function ApplyPage() {
  const garages = await getGarages();

  return (
    <>
      <PageHero
        title="Join Go Gro"
        subtitle="Complete your onboarding in a few quick steps and start accessing fuel credit at our partner garages."
      />

      <ApplyForm garages={garages} />
    </>
  );
}
