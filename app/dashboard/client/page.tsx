import Link from "next/link";
import { MapPin, LifeBuoy, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getClientLeadAndSubmissions } from "@/lib/data/client";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  form_sent: "Application Sent",
  form_started: "Application Started",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  dormant: "Dormant",
};

const statusStyles: Record<string, string> = {
  new: "bg-orange/10 text-orange",
  contacted: "bg-yellow/20 text-textdark",
  form_sent: "bg-blue-600/10 text-blue-600",
  form_started: "bg-blue-600/10 text-blue-600",
  submitted: "bg-navy/10 text-navy",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
  dormant: "bg-grey/40 text-textdark",
};

export default async function ClientHomePage() {
  const user = await requireUser();
  const { lead, submissions } = await getClientLeadAndSubmissions(user.id);
  const status = lead?.status ?? "new";
  const pending = submissions.find((s) => s.status === "pending" || s.status === "draft");

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Welcome back
      </h1>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Your Status</h2>
          {lead ? (
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                statusStyles[status] ?? statusStyles.new
              }`}
            >
              {statusLabels[status] ?? "New"}
            </span>
          ) : null}
        </div>

        {!lead ? (
          <div className="mt-4">
            <p className="text-textdark/70">
              You haven&apos;t registered your details yet. Get started so our
              team can help.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 mt-4 hover:bg-orange/90"
            >
              Get started
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-textdark/70">
              {status === "approved"
                ? "Great news — your application has been approved."
                : status === "rejected"
                  ? "We weren't able to approve your application this time. Contact support if you have questions."
                  : status === "submitted"
                    ? "We're reviewing your application. We'll be in touch shortly."
                    : "Our team is reviewing your enquiry and will be in touch."}
            </p>
          </div>
        )}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-navy" />
          <h2 className="text-lg font-semibold text-navy">Applications</h2>
        </div>
        <div className="mt-4 space-y-3">
          {pending ? (
            <Link
              href={`/apply/form/${pending.id}?token=${pending.access_token}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-orange/40 bg-orange/5 p-4 hover:border-orange"
            >
              <div>
                <p className="font-semibold text-textdark">
                  {pending.template_name ?? "Application"}
                </p>
                <p className="text-sm text-textdark/60">
                  Complete your application to continue.
                </p>
              </div>
              <span className="text-orange font-semibold shrink-0">
                Complete &rarr;
              </span>
            </Link>
          ) : null}
          {submissions.length === 0 ? (
            <p className="text-textdark/60">
              No applications yet. Our team will send you one when you&apos;re
              ready to proceed.
            </p>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-grey/40 p-4"
              >
                <div>
                  <p className="font-medium text-textdark">
                    {submission.template_name ?? "Application"}
                  </p>
                  <p className="text-sm text-textdark/60 capitalize">
                    {submission.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Link
          href="/dashboard/client/garages"
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
          href="/dashboard/client/support"
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