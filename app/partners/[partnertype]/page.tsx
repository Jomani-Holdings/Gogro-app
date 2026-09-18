import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/app/components/PageHero";
import { GarageGrid } from "@/app/components/partners/GarageGrid";
import { getPartnerTypes, getPartnerTypeBySlug } from "@/lib/data/partner-types";
import { getGaragesByTypeSlug } from "@/lib/data/garages";
import { getSeoMeta, DEFAULT_OG_IMAGE } from "@/lib/data/seo";

export async function generateStaticParams() {
  const types = await getPartnerTypes();
  return types.map((type) => ({ partnertype: type.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ partnertype: string }>;
}): Promise<Metadata> {
  const { partnertype } = await params;
  const type = await getPartnerTypeBySlug(partnertype);
  if (!type) return {};
  const routePath = `/partners/${partnertype}`;
  const seo = await getSeoMeta(routePath);
  const title = seo?.meta_title ?? `${type.name} | Go Gro Mobility`;
  const description = seo?.meta_description ?? type.description ?? undefined;
  return {
    title,
    description,
    robots: {
      index: seo ? !seo.noindex : true,
      follow: true,
    },
    alternates: {
      canonical: seo?.canonical_path ?? routePath,
    },
    openGraph: {
      type: "website",
      siteName: "Go Gro Mobility",
      title,
      description,
      images: [seo?.og_image_url ?? DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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
            ? "Tap a partner to view its location."
            : "No partners are available in this category yet."}
        </p>

        {garages.length > 0 ? (
          <GarageGrid garages={garages} partnerTypeSlug={type.slug} />
        ) : (
          <div className="bg-white border border-grey/40 rounded-xl p-10 text-center text-textdark/60 mt-6">
            We&apos;re onboarding partners in this category. Check back soon.
          </div>
        )}
      </section>
    </>
  );
}
