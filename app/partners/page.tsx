import Link from "next/link";
import { PageHero } from "@/app/components/PageHero";
import { getPartnerTypes } from "@/lib/data/partner-types";
import { resolveIcon } from "@/lib/service-icons";

export default async function PartnersPage() {
  const categories = await getPartnerTypes();

  return (
    <>
      <PageHero
        title="Partners"
        subtitle="Our network of partner garages keeps drivers moving across Cape Town."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => {
            const Icon = resolveIcon(category.icon_name);
            return (
              <div
                key={category.id}
                className="flex flex-col bg-white border border-grey/40 rounded-2xl p-8"
              >
                <div className="bg-navy w-12 h-12 rounded-full flex items-center justify-center text-white mb-4">
                  <Icon size={24} />
                </div>
                <h2 className="text-xl font-semibold text-navy">
                  {category.name}
                </h2>
                <p className="text-textdark/60 mt-2">{category.description}</p>
                <Link
                  href={`/partners/${category.slug}`}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90"
                >
                  View partners &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
