import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/auth";
import { SettingsForm } from "@/app/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin/settings");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Settings</h1>
      <p className="text-textdark/60 mt-1">
        Update your profile and password.
      </p>

      <div className="mt-8">
        <SettingsForm
          fullName={profile?.full_name ?? null}
          phone={profile?.phone ?? null}
          email={user.email ?? null}
        />
      </div>
    </div>
  );
}
