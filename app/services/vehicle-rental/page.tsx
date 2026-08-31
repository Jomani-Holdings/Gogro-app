import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";

const features = [
  {
    title: "Flexible rental terms",
    description:
      "Rental options built around the way eHailing drivers actually work.",
  },
  {
    title: "Road-ready vehicles",
    description:
      "Well-maintained vehicles so you can start earning from day one.",
  },
  {
    title: "Support when you need it",
    description:
      "A team behind you for the duration of your rental, not just at handover.",
  },
];

export default function VehicleRentalPage() {
  return (
    <>
      <PageHero
        title="Vehicle Rental"
        subtitle="Accessible vehicle rentals to keep you earning."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <p className="text-lg text-textdark/70 leading-relaxed">
          Whether you&apos;re starting out in eHailing or need a reliable car for your
          business, our vehicle rental service gives you access to road-ready
          vehicles without the long-term commitment of ownership. You focus on
          earning — we&apos;ll help keep you moving.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-grey/40 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-navy">
                {feature.title}
              </h3>
              <p className="text-textdark/70 mt-2 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-textdark/60 mt-12 text-sm">
          As part of our long-term roadmap, Go Gro is exploring electric vehicle
          fleets and sustainable mobility options, so our drivers are ready for
          whatever the road brings next.
        </p>
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Join Go Gro and access a vehicle rental when you need one."
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
