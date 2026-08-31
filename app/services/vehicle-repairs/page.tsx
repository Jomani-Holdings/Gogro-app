import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";

const features = [
  {
    title: "Trusted mechanics",
    description:
      "We connect you with mechanics we trust to get the job done right.",
  },
  {
    title: "Minimise downtime",
    description:
      "Quick repair assistance so your vehicle is back on the road sooner.",
  },
  {
    title: "Quality-assured work",
    description:
      "Repairs handled with care, because a reliable vehicle is your livelihood.",
  },
];

const steps = [
  "Request a repair and tell us what you need",
  "We connect you with a trusted partner garage",
  "Get back on the road and back to earning",
];

export default function VehicleRepairsPage() {
  return (
    <>
      <PageHero
        title="Vehicle Repairs"
        subtitle="Repair assistance to minimise downtime."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <p className="text-lg text-textdark/70 leading-relaxed">
          For an eHailing driver, every day your car is off the road is a day
          without income. Go Gro&apos;s repair assistance helps you get the right
          support from trusted mechanics, so downtime stays short and you stay
          earning.
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

        <div className="bg-white border border-grey/40 rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-navy">How it works</h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-orange text-white font-bold shrink-0">
                  {index + 1}
                </span>
                <p className="text-textdark/80 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Join Go Gro and keep your vehicle on the road."
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
