import Link from "next/link";
import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { siteConfig } from "@/app/lib/site-config";

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Our Services"
        subtitle="Everything you need to keep your vehicle on the road and your business growing — all in one platform."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          {siteConfig.services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-xl border border-grey/40 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-navy group-hover:text-orange">
                {service.label}
              </h2>
              <p className="text-sm text-textdark/60 mt-2">
                Learn more about {service.label.toLowerCase()} &rarr;
              </p>
            </Link>
          ))}
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
