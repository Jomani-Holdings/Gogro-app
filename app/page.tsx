import type { Metadata } from "next";
import { Hero } from "@/app/components/Hero";
import { TrustStrip } from "@/app/components/TrustStrip";
import { ServicesGrid } from "@/app/components/ServicesGrid";
import { HowItWorks } from "@/app/components/HowItWorks";
import { StatsBar } from "@/app/components/StatsBar";
import { CTASection } from "@/app/components/CTASection";
import { JsonLd } from "@/app/components/JsonLd";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { resolveMetadata, SITE_URL } from "@/lib/data/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolveMetadata("/");
}

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Go Gro Mobility",
          alternateName: "Go Gro",
          url: SITE_URL,
          description:
            "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
          inLanguage: "en-ZA",
          publisher: {
            "@type": "Organization",
            name: "Go Gro Mobility",
            url: SITE_URL,
          },
        }}
      />
      <Hero />
      <TrustStrip />
      <ServicesGrid />
      <StatsBar />
      <HowItWorks />
      <CTASection
        title="Ready to move forward?"
        subtitle="Chat to our team and find out how Go Gro Mobility can keep your business growing."
        buttonText="Contact Us on WhatsApp"
        buttonHref={getWhatsAppLink()}
      />
    </>
  );
}
