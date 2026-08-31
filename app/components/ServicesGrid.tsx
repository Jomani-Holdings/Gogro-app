import Link from "next/link";
import { Fuel, Car, Users, Wrench } from "lucide-react";

const services = [
  {
    title: "Fuel Credit",
    description: "Buy fuel on credit at our partner garages. Pay weekly. Drive more.",
    href: "/services/fuel-credit",
    icon: Fuel,
  },
  {
    title: "Vehicle Rental",
    description: "Affordable rentals for eHailing, business or personal use.",
    href: "/services/vehicle-rental",
    icon: Car,
  },
  {
    title: "Vehicle Management",
    description:
      "We handle licences, paperwork, insurance and more. You focus on earning.",
    href: "/services/vehicle-management",
    icon: Users,
  },
  {
    title: "Vehicle Repairs",
    description:
      "Request a repair and we'll connect you with trusted mechanics.",
    href: "/services/vehicle-repairs",
    icon: Wrench,
  },
];

const scrollbarHide =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function ServicesGrid() {
  return (
    <section id="services" className="py-16 md:py-24 bg-white scroll-mt-24">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <span className="text-orange font-bold uppercase tracking-widest text-sm mb-2 block">
          Our Services
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-navy mb-16">
          Everything You Need. All in One Place.
        </h2>

        <div
          className={`flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 pb-4 snap-x snap-mandatory -mx-6 md:mx-0 px-6 md:px-0 ${scrollbarHide}`}
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={index}
                href={service.href}
                className="w-[300px] shrink-0 snap-start bg-white rounded-2xl p-8 shadow-md border border-grey/20 flex flex-col h-full hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="bg-navy/5 w-16 h-16 rounded-full flex items-center justify-center text-navy mb-6 group-hover:bg-orange/10 group-hover:text-orange transition-colors self-center">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-textdark mb-3">
                  {service.title}
                </h3>
                <p className="text-textdark/70 flex-grow mb-6">
                  {service.description}
                </p>
                <span
                  aria-hidden="true"
                  className="text-orange font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Learn More &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
