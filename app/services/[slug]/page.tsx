import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getServices, getServiceBySlug } from "@/lib/data/services";
import { FALLBACK_SERVICE_DETAILS } from "@/lib/data/service-details";
import { renderRichText } from "@/lib/tiptap/render";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} | Go Gro Mobility`,
    description: service.description ?? undefined,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const detailHtml = renderRichText(
    service.detail_content ?? FALLBACK_SERVICE_DETAILS[service.slug] ?? null
  );

  return (
    <>
      <PageHero
        title={service.name}
        subtitle={service.description ?? undefined}
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        {detailHtml ? (
          <div
            className="prose prose-lg max-w-none text-textdark/80 [&_p]:leading-relaxed [&_p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-10 [&_a]:text-orange [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: detailHtml }}
          />
        ) : (
          <div className="bg-white border border-grey/40 rounded-2xl p-10">
            <p className="text-lg text-textdark/70">
              {service.description ??
                "Detailed service content will be added here."}
            </p>
          </div>
        )}

        {service.features.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {service.features.map((feature) => (
              <div
                key={feature}
                className="bg-white border border-grey/40 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-navy">{feature}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle={`Join Go Gro and access ${service.name.toLowerCase()}.`}
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
