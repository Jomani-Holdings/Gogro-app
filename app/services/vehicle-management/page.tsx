import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";

const features = [
  {
    title: "Licences & paperwork",
    description:
      "We help you keep licences and documentation up to date and in order.",
  },
  {
    title: "Insurance assistance",
    description:
      "Guidance on keeping the right cover so you can drive with confidence.",
  },
  {
    title: "Admin off your plate",
    description:
      "Less time on paperwork, more time on the road earning an income.",
  },
];

export default function VehicleManagementPage() {
  return (
    <>
      <PageHero
        title="Vehicle Management"
        subtitle="Keep your vehicle on the road and your business running."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <p className="text-lg text-textdark/70 leading-relaxed">
          Running a vehicle is about more than just driving. Licences, insurance
          and paperwork can quietly eat into your time and income. Go Gro&apos;s
          vehicle management support takes the admin off your plate so you can
          focus on earning.
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
          We&apos;re building Go Gro to grow with our drivers — including support for
          the transition to electric vehicles, home charging and solar-powered
          solutions in the years ahead.
        </p>
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
