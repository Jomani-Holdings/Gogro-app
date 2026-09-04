import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function DashboardEntryPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/driver");
}
