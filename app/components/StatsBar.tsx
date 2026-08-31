import { Users, Fuel, Car, Wrench } from "lucide-react";

const stats = [
  { value: "R5 million+", label: "Fuel Credit Supplied", icon: Fuel },
  { value: "800+", label: "Active Drivers", icon: Users },
  { value: "7+", label: "Partner Garages", icon: Wrench },
  { value: "400+", label: "Vehicles Managed", icon: Car },
];

export function StatsBar() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x-0 lg:divide-x divide-white/20 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-3"
              >
                <Icon size={36} className="text-orange mb-2" />
                <span className="text-4xl md:text-5xl font-bold">
                  {stat.value}
                </span>
                <span className="text-sm md:text-base font-medium text-grey">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
