import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";

export default function VehicleManagementPage() {
  return (
    <>
      <PageHero
        title="Vehicle Management"
        subtitle="Keep your vehicle on the road and your business running."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <div className="bg-white border border-grey/40 rounded-2xl p-10">
          {/* PLACEHOLDER CONTENT */}
          <p className="text-lg text-textdark/70">
            Detailed service content for Vehicle Management will be added here.
          </p>
        </div>
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Join Go Gro and let us help you manage your vehicle."
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
