import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/app/components/PageHero";
import { EmptyState } from "@/app/components/EmptyState";
import { CTASection } from "@/app/components/CTASection";
import { getGalleryImages } from "@/lib/data/galleries";
import { resolveMetadata, getSeoMeta } from "@/lib/data/seo";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { mediaUrl } from "@/lib/media";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata("/gallery");
}

export default async function GalleryPage() {
  const [images, seo] = await Promise.all([
    getGalleryImages(),
    getSeoMeta("/gallery"),
  ]);

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle={
          seo?.page_title ??
          "See Go Gro Mobility in action — fuel partners, vehicles, drivers and events."
        }
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20">
        {images.length === 0 ? (
          <div className="bg-white border border-grey/40 rounded-2xl">
            <EmptyState
              title="Our gallery is currently empty"
              description="Check back soon for updates!"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {images.map((image) => (
              <figure
                key={image.id}
                className="group overflow-hidden rounded-2xl bg-white border border-grey/40 shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={mediaUrl(image.storage_path)}
                    alt={image.alt_text ?? image.caption ?? image.filename}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-5">
                  {image.caption ? (
                    <h3 className="text-lg font-bold text-textdark">
                      {image.caption}
                    </h3>
                  ) : null}
                  {image.description ? (
                    <p className="mt-2 text-sm text-textdark/70 leading-relaxed">
                      {image.description}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Chat to our team and find out how Go Gro Mobility can keep your business growing."
        buttonText="Contact Us on WhatsApp"
        buttonHref={getWhatsAppLink()}
      />
    </>
  );
}