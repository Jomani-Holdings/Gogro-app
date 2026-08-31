import { notFound } from "next/navigation";
import { PageHero } from "@/app/components/PageHero";
import { PartnerGarageList } from "@/app/components/PartnerGarageList";

const partnerTypes: Record<string, string> = {
  fuel: "Fuel Partners",
  service: "Service Partners",
};

export function generateStaticParams() {
  return Object.keys(partnerTypes).map((partnertype) => ({ partnertype }));
}

export default async function PartnerTypePage({
  params,
}: {
  params: Promise<{ partnertype: string }>;
}) {
  const { partnertype } = await params;

  const label = partnerTypes[partnertype];

  if (!label) {
    notFound();
  }

  return (
    <>
      <PageHero title={label} subtitle="Our trusted network of partners." />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-2xl font-semibold text-textdark">
          {label} Near You
        </h2>
        <p className="text-textdark/60 mt-2">
          Information cards for all active {label.toLowerCase()}.
        </p>

        <PartnerGarageList key={partnertype} partnertype={partnertype} />
      </section>
    </>
  );
}
