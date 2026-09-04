import Link from "next/link";
import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getServices } from "@/lib/data/services";
import { resolveIcon } from "@/lib/service-icons";

export default async function ServicesPage() {
  const services = (await getServices()).filter(
    (service) => service.slug !== "vehicle-repairs"
  );

  return (
    <>
      <PageHero
        title="Our Services"
        subtitle="Everything you need to keep your vehicle on the road and your business growing — all in one platform."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          {services.map((service) => {
            const Icon = resolveIcon(service.icon_name);
            return (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="flex flex-col rounded-2xl border border-grey/40 bg-white p-8"
              >
                <div className="bg-navy/5 w-16 h-16 rounded-full flex items-center justify-center text-navy mb-6">
                  <Icon size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-navy">
                  {service.name}
                </h2>
                <p className="text-textdark/70 mt-3">{service.description}</p>
                <ul className="flex flex-col gap-2 mt-5 mb-6">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-textdark/80"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-orange shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90">
                  Learn more &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Join Go Gro and keep your business growing."
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
