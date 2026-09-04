import { Car, Fuel, Users, Wrench, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  fuel: Fuel,
  car: Car,
  users: Users,
  wrench: Wrench,
};

export function resolveIcon(name: string | null | undefined): LucideIcon {
  return ICONS[name ?? ""] ?? Wrench;
}
