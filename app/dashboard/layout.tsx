import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { SuspendedScreen } from "@/app/components/dashboard/SuspendedScreen";
import { InactiveAccountBanner } from "@/app/components/dashboard/InactiveAccountBanner";
import { adminNav, adminSiteGroup, clientNav } from "@/lib/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.suspended && profile.role === "client") {
    return <SuspendedScreen />;
  }

  const isAdmin = profile.role === "admin";
  const showInactiveBanner =
    !isAdmin && profile.driver_status === "inactive";

  return (
    <DashboardShell
      navItems={isAdmin ? adminNav : clientNav}
      navGroups={isAdmin ? [adminSiteGroup] : undefined}
      role={profile.role}
      fullName={profile.full_name}
      email={profile.email}
    >
      {showInactiveBanner ? <InactiveAccountBanner /> : null}
      {children}
    </DashboardShell>
  );
}
