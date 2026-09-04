import { howItWorksSteps } from "@/lib/data/how-it-works";

export function HowItWorks() {
  return (
    <section className="bg-offwhite py-16 md:py-24 border-b border-grey/20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <span className="text-orange font-bold uppercase tracking-widest text-sm mb-2 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy">
            Four Steps to Keep Moving
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                <div className="bg-navy w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-textdark mb-2">
                  {step.title}
                </h3>
                <p className="text-textdark/70">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
