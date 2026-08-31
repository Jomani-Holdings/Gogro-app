import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";

export default function RewardsPage() {
  return (
    <>
      <PageHero
        title="Driver Rewards"
        subtitle="Rewarding loyalty rather than simply offering fuel credit."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <div className="bg-white border border-grey/40 rounded-2xl p-10 text-center">
          <span className="inline-flex items-center gap-2 bg-yellow/20 text-textdark font-semibold text-sm uppercase tracking-widest rounded-full px-4 py-2">
            Coming Soon
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-textdark mt-6">
            Driver Rewards Programme
          </h2>

          <p className="text-lg text-textdark/70 mt-4 max-w-2xl mx-auto">
            {/* PLACEHOLDER: loyalty/rewards programme copy from the Master Spec */}
            Our Driver Rewards Programme rewards drivers who join the platform,
            remain active, and successfully manage their fuel accounts. More
            details on rewards and benefits will be shared here soon.
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
