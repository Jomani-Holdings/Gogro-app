import Link from "next/link";
import { PageHero } from "@/app/components/PageHero";
import { Fuel, Wrench } from "lucide-react";

const categories = [
  {
    slug: "fuel",
    label: "Fuel Partners",
    description: "Garages where you can access fuel credit.",
    icon: Fuel,
  },
  {
    slug: "service",
    label: "Service Partners",
    description: "Garages offering vehicle maintenance and repairs.",
    icon: Wrench,
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        title="Partners"
        subtitle="Our network of partner garages keeps drivers moving across Cape Town."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/partners/${category.slug}`}
                className="bg-white border border-grey/40 rounded-2xl p-8"
              >
                <div className="bg-navy w-12 h-12 rounded-full flex items-center justify-center text-white mb-4">
                  <Icon size={24} />
                </div>
                <h2 className="text-xl font-semibold text-navy">
                  {category.label}
                </h2>
                <p className="text-textdark/60 mt-2">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
