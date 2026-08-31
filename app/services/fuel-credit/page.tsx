import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";

const features = [
  {
    title: "Weekly payment cycles",
    description:
      "Refuel when you need it and settle your account weekly — no complicated terms.",
  },
  {
    title: "No upfront fuel costs",
    description:
      "Keep your cash for other essentials while you fill up at our partner garages.",
  },
  {
    title: "Trusted partner network",
    description:
      "Access fuel at garages across the Western Cape that know and support Go Gro drivers.",
  },
];

const steps = [
  "Join Go Gro and complete your onboarding",
  "Collect fuel at your selected partner garage",
  "Pay your account weekly and keep earning",
];

export default function FuelCreditPage() {
  return (
    <>
      <PageHero
        title="Fuel Credit"
        subtitle="Fuel credit designed to keep drivers on the road."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <p className="text-lg text-textdark/70 leading-relaxed">
          Fuel is the biggest weekly cost for most eHailing drivers. Go Gro&apos;s
          fuel credit programme removes that pressure by letting you refuel at our
          partner garages and pay weekly. It&apos;s designed to keep your vehicle on
          the road and your income flowing.
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

        <p className="text-textdark/60 mt-12 text-sm">
          Looking ahead, we&apos;re preparing for the future of mobility — including
          research into electric vehicle charging, home charging and
          solar-compatible solutions. Fuel remains our focus today, but Go Gro is
          positioning drivers for the next generation of the road.
        </p>
      </section>

      <CTASection
        title="Ready to move forward?"
        subtitle="Join Go Gro and start accessing fuel credit at our partner garages."
        buttonText="Apply Now"
        buttonHref="/apply"
      />
    </>
  );
}
