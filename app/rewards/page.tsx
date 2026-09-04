import { PageHero } from "@/app/components/PageHero";
import { CTASection } from "@/app/components/CTASection";
import { getWhatsAppLink } from "@/app/lib/site-config";
import { Fuel, Wallet, Wrench } from "lucide-react";

const benefits = [
  {
    icon: Fuel,
    title: "Fuel Credit and Bonus",
    description:
      "Drivers who maintain a strong payment record can unlock additional fuel credit and free fuel rewards. Free fuel can be earned through consistent, on-time payments and by successfully referring other drivers to the Go Gro platform.",
  },
  {
    icon: Wallet,
    title: "Cash Rewards",
    description:
      "Qualifying drivers can also earn cash rewards through selected Go Gro reward programmes and promotions like our referral programme. Drivers who refer quality drivers and actively contribute to and grow within the Go Gro community earn cash back rewards.",
  },
  {
    icon: Wrench,
    title: "Vehicle Repair Finance",
    description:
      "Eligible drivers can access financial assistance towards vehicle-related expenses, including repairs, servicing, tyres and batteries, helping you get back on the road when unexpected costs arise.",
  },
];

export default function RewardsPage() {
  return (
    <>
      <PageHero
        title="Driver Rewards & Benefits"
        subtitle="Good account management unlocks more."
      />

      <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-textdark">
          Good Account Management Unlocks More
        </h2>
        <p className="text-lg text-textdark/70 mt-4">
          At Go Gro, we believe responsible drivers should be rewarded.
        </p>
        <p className="text-lg text-textdark/70 mt-2">
          Drivers who consistently manage their Go Gro Fuel accounts well, make
          payments on time and maintain a positive account history can unlock
          additional rewards and benefits.
        </p>

        <div className="grid gap-6 mt-10">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white border border-grey/40 rounded-xl p-8"
              >
                <div className="bg-navy/5 w-14 h-14 rounded-full flex items-center justify-center text-navy mb-4">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-navy">
                  {benefit.title}
                </h3>
                <p className="text-textdark/70 mt-3">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-offwhite rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-textdark">
            Build Your Record. Unlock More.
          </h2>
          <p className="text-textdark/70 mt-3">
            Go Gro Rewards &amp; Benefits are not automatically available to
            every driver. Eligibility is based on your account history, payment
            behavior, membership period and the applicable programme terms.
          </p>
          <p className="text-textdark/70 mt-3">
            The better you manage your Go Gro account, the more benefits you can
            unlock.
          </p>
          <p className="text-sm text-textdark/50 mt-4">
            Terms and Conditions Apply.
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
