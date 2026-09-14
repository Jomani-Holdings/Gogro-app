import { Users, Fuel, Car, MapPin } from "lucide-react";

const stats = [
  { value: "R5M+", label: "Fuel access facilitated", icon: Fuel },
  { value: "250+", label: "Drivers supported", icon: Users },
  { value: "400+", label: "Vehicles managed", icon: Car },
  { value: "8", label: "Fuel partner locations", icon: MapPin },
];

export function StatsBar() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Our Impact
        </h2>
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
