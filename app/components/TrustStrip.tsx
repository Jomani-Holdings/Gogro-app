import { Clock, Wallet, ShieldCheck, User } from "lucide-react";

const trustItems = [
  { icon: Clock, title: "Convenient", desc: "Everything you need, in one place." },
  { icon: Wallet, title: "Affordable", desc: "Flexible options that fit your journey." },
  { icon: ShieldCheck, title: "Reliable", desc: "Trusted partners. Quality service." },
  { icon: User, title: "Built for Drivers", desc: "Solutions that keep you moving." },
];

const scrollbarHide =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function TrustStrip() {
  return (
    <section className="bg-offwhite py-12 border-b border-grey/20">
      <div className="container mx-auto px-6 md:px-12">
        <div
          className={`flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 pb-4 snap-x snap-mandatory -mx-6 md:mx-0 px-6 md:px-0 ${scrollbarHide}`}
        >
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="min-w-[260px] md:min-w-0 snap-start flex items-start gap-4"
              >
                <div className="bg-navy/10 p-3 rounded-full text-navy shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-textdark text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-textdark/70">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
