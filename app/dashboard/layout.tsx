import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { adminNav, driverNav } from "@/lib/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const isAdmin = profile.role === "admin";

  return (
    <DashboardShell
      navItems={isAdmin ? adminNav : driverNav}
      role={profile.role}
      fullName={profile.full_name}
      email={profile.email}
    >
      {children}
    </DashboardShell>
  );
}
