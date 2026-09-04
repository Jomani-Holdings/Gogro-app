import Link from "next/link";
import { CreditCard, MapPin, LifeBuoy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDriverApplication } from "@/lib/data/driver";

const statusLabels: Record<string, string> = {
  incomplete: "Incomplete",
  new: "New",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

const statusStyles: Record<string, string> = {
  incomplete: "bg-grey/40 text-textdark",
  new: "bg-orange/10 text-orange",
  in_review: "bg-yellow/20 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

export default async function DriverHomePage() {
  const user = await requireUser();
  const application = await getDriverApplication(user.id);

  const status = application?.status ?? "incomplete";

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Welcome back
      </h1>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">
            Application Status
          </h2>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              statusStyles[status] ?? statusStyles.incomplete
            }`}
          >
            {statusLabels[status] ?? "Incomplete"}
          </span>
        </div>

        {status === "incomplete" ? (
          <div className="mt-4">
            <p className="text-textdark/70">
              Your application isn&apos;t complete yet. Finish your onboarding to
              access fuel credit.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 mt-4 hover:bg-orange/90"
            >
              Complete application
            </Link>
          </div>
        ) : (
          <p className="text-textdark/70 mt-4">
            {status === "approved"
              ? "Great news — your application has been approved."
              : status === "rejected"
                ? "We weren't able to approve your application this time. Contact support if you have questions."
                : "We're reviewing your application. We'll be in touch shortly."}
          </p>
        )}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-3">
          <CreditCard size={20} className="text-navy" />
          <h2 className="text-lg font-semibold text-navy">Fuel Credit Limit</h2>
        </div>
        <p className="text-textdark/70 mt-3">
          {application?.weekly_credit_band
            ? `Your selected weekly credit band is ${application.weekly_credit_band}.`
            : "Your approved credit limit will appear here once your application is approved."}
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Link
          href="/dashboard/driver/garages"
          className="flex items-center gap-3 bg-white border border-grey/40 rounded-2xl p-5 hover:border-orange transition-colors"
        >
          <MapPin size={22} className="text-orange shrink-0" />
          <div>
            <p className="font-semibold text-textdark">Find a Garage</p>
            <p className="text-sm text-textdark/60">
              Locate nearby partner garages
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/driver/support"
          className="flex items-center gap-3 bg-white border border-grey/40 rounded-2xl p-5 hover:border-orange transition-colors"
        >
          <LifeBuoy size={22} className="text-orange shrink-0" />
          <div>
            <p className="font-semibold text-textdark">Support</p>
            <p className="text-sm text-textdark/60">
              Breakdown, accident or help
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
