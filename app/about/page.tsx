import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        subtitle="A mobility solutions company focused on helping entrepreneurs move, operate and grow."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-textdark">
          About Go Gro Mobility
        </h2>
        <p className="text-lg text-textdark/70 mt-4">
          Go Gro Mobility is a mobility solutions company focused on helping
          entrepreneurs move, operate and grow.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          A venture of Jomani Holdings, Go Gro was created to make the mobility
          industry more accessible by connecting mobility entrepreneurs with the
          vehicles, fuel, maintenance support, technology and services they need
          to keep moving.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          We support entrepreneurs operating across the mobility economy —
          including e-hailing, logistics, deliveries, tourism and other
          transport-related businesses.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Our approach goes beyond providing individual services. We are
          building an ecosystem where mobility entrepreneurs can access the
          tools, support and partnerships they need through one trusted
          platform.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          From fuel solutions and vehicle access to repairs, vehicle management
          and driver benefits, Go Gro is designed to remove some of the everyday
          barriers that prevent mobility entrepreneurs from growing sustainable
          businesses.
        </p>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textdark">
                Our Mission
              </h2>
              <p className="text-lg text-textdark/70 mt-4">
                To empower mobility entrepreneurs by providing accessible,
                practical and reliable solutions that keep them moving and help
                their businesses grow.
              </p>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textdark">
                Our Vision
              </h2>
              <p className="text-lg text-textdark/70 mt-4">
                To build one of South Africa&apos;s leading mobility ecosystems —
                connecting entrepreneurs, vehicles, fuel partners, service
                providers and technology through one platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-textdark">
          Moving People. Growing Businesses.
        </h2>
        <p className="text-lg text-textdark/70 mt-4">
          At Go Gro, we believe mobility creates opportunity.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Every vehicle on the road can represent an income opportunity, a small
          business, a livelihood and a path towards greater economic
          independence.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Our role is simple: help mobility entrepreneurs keep moving, earning
          and growing.
        </p>
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
