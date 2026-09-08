import { MessageCircle, AlertTriangle, CarFront, Headphones } from "lucide-react";
import { getWhatsAppLink, siteConfig } from "@/app/lib/site-config";

const actions = [
  {
    title: "Breakdown Assistance",
    description: "Your vehicle has broken down and you need immediate help.",
    icon: AlertTriangle,
    href: getWhatsAppLink(
      "Hi Go Gro Mobility, I need breakdown assistance right now."
    ),
    external: true,
    color: "text-error",
  },
  {
    title: "Report an Accident",
    description: "Report an accident and get guidance on the next steps.",
    icon: CarFront,
    href: getWhatsAppLink(
      "Hi Go Gro Mobility, I would like to report an accident."
    ),
    external: true,
    color: "text-orange",
  },
  {
    title: "General Support",
    description: "Questions about your account, fuel credit, or services.",
    icon: Headphones,
    href: getWhatsAppLink(),
    external: true,
    color: "text-navy",
  },
  {
    title: "Email Us",
    description: `Prefer email? Reach us at ${siteConfig.email}.`,
    icon: MessageCircle,
    href: `mailto:${siteConfig.email}`,
    external: false,
    color: "text-success",
  },
];

export default function DriverSupportPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Support</h1>
      <p className="text-textdark/60 mt-1">
        One-tap access to the help you need, when you need it.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {actions.map((action) => {
          const Icon = action.icon;
          const inner = (
            <>
              <Icon size={24} className={action.color} />
              <h3 className="font-semibold text-textdark">{action.title}</h3>
              <p className="text-sm text-textdark/60 mt-1">
                {action.description}
              </p>
            </>
          );

          return action.external ? (
            <a
              key={action.title}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-grey/40 rounded-2xl p-6 flex flex-col gap-2 hover:border-orange transition-colors"
            >
              {inner}
            </a>
          ) : (
            <a
              key={action.title}
              href={action.href}
              className="bg-white border border-grey/40 rounded-2xl p-6 flex flex-col gap-2 hover:border-orange transition-colors"
            >
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}
