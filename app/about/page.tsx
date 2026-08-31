import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";

const services = [
  "Fuel Credit",
  "Vehicle Rentals",
  "Driver Rewards Programme",
  "Vehicle Maintenance & Repair Assistance",
  "Mobility Business Support",
];

const values = [
  {
    title: "Drivers First",
    description: "Every decision we make should improve the lives of our drivers.",
  },
  {
    title: "Trust",
    description:
      "We build long-term relationships through honesty, transparency and consistency.",
  },
  {
    title: "Innovation",
    description:
      "We continuously improve our products and processes to make life easier for our customers.",
  },
  {
    title: "Growth",
    description: "When our drivers grow, our garages grow, and Go Gro grows.",
  },
];

const cultureValues = [
  "Professional",
  "Friendly",
  "Responsive",
  "Honest",
  "Solution-focused",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        subtitle="A South African mobility company focused on helping eHailing drivers build sustainable businesses."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-textdark">
          Welcome to Go Gro Mobility
        </h2>
        <p className="text-lg text-textdark/70 mt-4">
          Welcome to the Go Gro team!
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Go Gro Mobility is a South African mobility company focused on helping
          eHailing drivers build sustainable businesses. We believe drivers need
          more than just access to fuel—they need a trusted partner that helps
          them succeed.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Everything we build is designed to reduce financial pressure on
          drivers while helping them keep their vehicles on the road and earning
          income. Our long-term vision is to become the leading mobility
          platform for independent drivers across South Africa.
        </p>

        <h3 className="text-2xl font-semibold text-navy mt-10 mb-4">
          Today, our services include:
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <li
              key={service}
              className="flex items-center gap-3 bg-white border border-grey/40 rounded-lg p-4 text-textdark"
            >
              <span className="h-2 w-2 rounded-full bg-orange shrink-0" />
              {service}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textdark">
                Our Mission
              </h2>
              <p className="text-lg text-textdark/70 mt-4">
                To make mobility more affordable, accessible and sustainable by
                providing practical financial and vehicle solutions that help
                drivers grow their businesses.
              </p>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textdark">
                Our Vision
              </h2>
              <p className="text-lg text-textdark/70 mt-4">
                To build South Africa&apos;s most trusted mobility
                ecosystem—where drivers can access every service they need
                through one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-textdark">
          Our Values
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-white border border-grey/40 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-navy">{value.title}</h3>
              <p className="text-textdark/70 mt-2">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-textdark">
            Our Culture
          </h2>
          <p className="text-lg text-textdark/70 mt-4 max-w-3xl">
            We believe that every interaction matters. Whether speaking to a
            driver, garage owner or supplier, we aim to be:
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {cultureValues.map((value) => (
              <span
                key={value}
                className="bg-white border border-grey/40 text-navy rounded-full px-4 py-2 text-sm font-semibold"
              >
                {value}
              </span>
            ))}
          </div>
          <p className="text-lg text-textdark/70 mt-6 max-w-3xl">
            We don&apos;t simply provide services—we build lasting
            relationships.
          </p>
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
