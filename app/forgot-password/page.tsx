import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPathForRole } from "@/lib/auth";
import { ForgotPasswordWizard } from "@/app/components/auth/ForgotPasswordWizard";

export default async function ForgotPasswordPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(dashboardPathForRole(profile.role));

  return (
    <section className="container mx-auto px-6 md:px-12 py-16 md:py-20">
      <div className="max-w-md mx-auto bg-white border border-grey/40 rounded-2xl p-8 md:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-navy mb-2">Reset your password</h2>
        <p className="text-textdark/60 text-sm mb-6">
          We&apos;ll email you a one-time code to verify it&apos;s you, then you
          can choose a new password.
        </p>
        <ForgotPasswordWizard />
      </div>
    </section>
  );
}