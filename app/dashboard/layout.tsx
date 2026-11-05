import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { SuspendedScreen } from "@/app/components/dashboard/SuspendedScreen";
import { InactiveAccountBanner } from "@/app/components/dashboard/InactiveAccountBanner";
import { adminNav, adminSiteGroup, clientNav } from "@/lib/dashboard-nav";
import { getNotificationSnapshot } from "@/lib/data/notifications";

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
  const notifications = await getNotificationSnapshot(profile.user_id);

  return (
    <DashboardShell
      navItems={isAdmin ? adminNav : clientNav}
      navGroups={isAdmin ? [adminSiteGroup] : undefined}
      role={profile.role}
      fullName={profile.full_name}
      email={profile.email}
      userId={profile.user_id}
      initialNotifications={notifications.items}
      initialUnreadCount={notifications.unreadCount}
    >
      {showInactiveBanner ? <InactiveAccountBanner /> : null}
      {children}
    </DashboardShell>
  );
}
