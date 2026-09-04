import { ClipboardList, BadgeCheck, UserCheck, Car } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type HowItWorksStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: ClipboardList,
    title: "Apply",
    description:
      "Complete an application and provide the required driver and e-hailing documentation.",
  },
  {
    icon: BadgeCheck,
    title: "Get Approved",
    description: "Our team reviews your application and confirms your eligibility.",
  },
  {
    icon: UserCheck,
    title: "Get Matched",
    description:
      "Once approved, we work to match you with an available rental vehicle.",
  },
  {
    icon: Car,
    title: "Get Moving",
    description:
      "Complete the rental process, collect your vehicle and start earning.",
  },
];
