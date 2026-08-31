import { PageHero } from "@/app/components/PageHero";
import { PartnerGarageGrid } from "@/app/components/PartnerGarageGrid";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { ClipboardList, BadgeCheck, Car } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Apply",
    description: "Fill in your details online or chat to us on WhatsApp.",
  },
  {
    icon: BadgeCheck,
    title: "Get Approved",
    description: "We review your profile and connect you to the right solution.",
  },
  {
    icon: Car,
    title: "Drive",
    description: "Access fuel credit, rentals, or repairs and keep earning.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        title="How It Works"
        subtitle="Three simple steps to access fuel credit, vehicle rentals, and more — built to keep you moving."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                <div className="bg-navy w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-textdark mb-2">
                  {step.title}
                </h3>
                <p className="text-textdark/70">{step.description}</p>
              </div>
            );
          })}
        </div>

        <PartnerGarageGrid />
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
