import { ForgotPasswordForm } from "@/app/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="container mx-auto px-6 md:px-12 py-16 md:py-20">
      <div className="max-w-md mx-auto bg-white border border-grey/40 rounded-2xl p-8 md:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-navy mb-6">Reset your password</h2>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
