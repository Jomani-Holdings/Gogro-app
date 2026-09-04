import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "@/app/components/dashboard/SettingsForm";

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Settings</h1>
      <p className="text-textdark/60 mt-1">
        Update your admin profile and password.
      </p>

      <div className="mt-8">
        <SettingsForm
          fullName={profile.full_name}
          phone={profile.phone}
          email={profile.email}
        />
      </div>
    </div>
  );
}
