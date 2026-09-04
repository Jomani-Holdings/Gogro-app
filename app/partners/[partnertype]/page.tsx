import { notFound } from "next/navigation";
import { PageHero } from "@/app/components/PageHero";
import { GarageGrid } from "@/app/components/partners/GarageGrid";
import { getPartnerTypes, getPartnerTypeBySlug } from "@/lib/data/partner-types";
import { getGaragesByTypeSlug } from "@/lib/data/garages";

export async function generateStaticParams() {
  const types = await getPartnerTypes();
  return types.map((type) => ({ partnertype: type.slug }));
}

export default async function PartnerTypePage({
  params,
}: {
  params: Promise<{ partnertype: string }>;
}) {
  const { partnertype } = await params;

  const type = await getPartnerTypeBySlug(partnertype);
  if (!type) notFound();

  const garages = await getGaragesByTypeSlug(partnertype);

  return (
    <>
      <PageHero
        title={type.name}
        subtitle={type.description ?? undefined}
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-2xl font-semibold text-textdark">
          {type.name} Near You
        </h2>
        <p className="text-textdark/60 mt-2">
          {garages.length > 0
            ? "Tap a partner to view its address and location."
            : "No partners are available in this category yet."}
        </p>

        {garages.length > 0 ? (
          <GarageGrid garages={garages} />
        ) : (
          <div className="bg-white border border-grey/40 rounded-xl p-10 text-center text-textdark/60 mt-6">
            We&apos;re onboarding partners in this category. Check back soon.
          </div>
        )}
      </section>
    </>
  );
}
