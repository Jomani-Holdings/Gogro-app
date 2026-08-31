import { Hero } from "@/app/components/Hero";
import { TrustStrip } from "@/app/components/TrustStrip";
import { ServicesGrid } from "@/app/components/ServicesGrid";
import { HowItWorks } from "@/app/components/HowItWorks";
import { StatsBar } from "@/app/components/StatsBar";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";

export default function Home() {
  return (
    <>
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
