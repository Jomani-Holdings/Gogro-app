import { PageHero } from "@/app/components/PageHero";
import { GarageGrid } from "@/app/components/partners/GarageGrid";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { getGaragesByTypeSlug } from "@/lib/data/garages";
import { howItWorksSteps } from "@/lib/data/how-it-works";

export default async function HowItWorksPage() {
  const fuelGarages = await getGaragesByTypeSlug("fuel");

  return (
    <>
      <PageHero
        title="How It Works"
        subtitle="Three simple steps to access fuel credit, vehicle rentals, and more — built to keep you moving."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorksSteps.map((step, index) => {
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

        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-textdark">
            Our Partner Garages
          </h3>
          <p className="text-textdark/60 mt-2">
            Fuel credit is available at these active partner garages.
          </p>
          <GarageGrid garages={fuelGarages} />
        </div>
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
