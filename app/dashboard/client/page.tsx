import Link from "next/link";
import { MapPin, LifeBuoy, FileText, Car } from "lucide-react";
import { requireClient } from "@/lib/auth";
import {
  getClientLeadAndSubmissions,
  getClientRequiredActions,
  getClientBalances,
  getClientProgrammeContext,
} from "@/lib/data/client";
import { getClientDocumentsContext } from "@/lib/data/documents";
import { ClientDocumentsUpload } from "@/app/components/dashboard/ClientDocumentsUpload";
import { RequiredActions } from "@/app/components/dashboard/RequiredActions";
import { formatMoney } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  form_sent: "Application Sent",
  form_started: "Application Started",
  submitted: "Submitted",
  documents_requested: "Documents Requested",
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
  documents_requested: "bg-yellow/30 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
  dormant: "bg-grey/40 text-textdark",
};

export default async function ClientHomePage() {
  const profile = await requireClient();
  const { lead, submissions } = await getClientLeadAndSubmissions(
    profile.user_id
  );
  const { documents, contractDownloadUrl } = await getClientDocumentsContext(
    profile.user_id
  );
  const requiredActions = await getClientRequiredActions(profile.user_id);
  const balances = await getClientBalances(profile.user_id);
  const programme = await getClientProgrammeContext(profile.user_id);
  const status = lead?.status ?? "new";
  const pending = submissions.find((s) => s.status === "pending" || s.status === "draft");

  const isRental = programme.primary_service === "vehicle-rental";

  function formatDueDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        Welcome back
      </h1>

      <RequiredActions actions={requiredActions} />

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
                  : status === "documents_requested"
                    ? "We need a few documents from you before we can continue. Please upload them below."
                    : status === "submitted"
                      ? "We're reviewing your application. We'll be in touch shortly."
                      : "Our team is reviewing your enquiry and will be in touch."}
            </p>
          </div>
        )}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-navy">Your Account</h2>
          {balances?.is_overdue ? (
            <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold bg-error text-white">
              OVERDUE
            </span>
          ) : null}
        </div>

        {isRental ? (
          <div className="mt-4">
            {!programme.hasVehicle ? (
              <div className="rounded-xl border-2 border-orange/40 bg-orange/5 p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                    <Car size={22} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-textdark">
                      Pending Vehicle Assignment
                    </h3>
                    <p className="text-textdark/70 mt-1">
                      Your rental application has been approved and you&apos;re in
                      the queue. We&apos;ll assign a rental vehicle to you shortly —
                      keep an eye on your dashboard for the update.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-grey/40 bg-offwhite p-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <Car size={22} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-textdark">
                      Your vehicle is ready
                    </h3>
                    <p className="text-textdark/70 mt-1">
                      {programme.vehicle?.make_model ?? "Assigned vehicle"} ·{" "}
                      {programme.vehicle?.registration ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {balances ? (
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-grey/40 bg-offwhite p-4">
                  <p className="text-xs font-medium text-textdark/50">
                    Total Balance Owed
                  </p>
                  <p className="text-lg font-bold text-textdark mt-1">
                    {formatMoney(balances.driver_balance, 2)}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-4 rounded-xl border border-grey/40 bg-offwhite px-4 py-3 text-sm text-textdark/80">
                  Next payment due:{" "}
                  <span className="font-semibold text-textdark">
                    {formatDueDate(balances.next_payment_due)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-textdark/60 text-sm">
                No account details yet.
              </p>
            )}
          </div>
        ) : balances ? (
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-grey/40 bg-offwhite p-4">
              <p className="text-xs font-medium text-textdark/50">
                Total Balance Owed
              </p>
              <p className="text-lg font-bold text-textdark mt-1">
                {formatMoney(balances.driver_balance, 2)}
              </p>
            </div>
            <div className="rounded-xl border border-grey/40 bg-offwhite p-4">
              <p className="text-xs font-medium text-textdark/50">
                Fuel Credit
              </p>
              <p className="text-lg font-bold text-textdark mt-1">
                {formatMoney(balances.weekly_fuel_limit, 2)}
              </p>
            </div>
            <div className="rounded-xl border border-grey/40 bg-offwhite p-4">
              <p className="text-xs font-medium text-textdark/50">
                Fuel Used This Cycle
              </p>
              <p className="text-lg font-bold text-textdark mt-1">
                {formatMoney(balances.weekly_fuel_issued, 2)}
              </p>
            </div>
            <div className="rounded-xl border border-grey/40 bg-offwhite p-4">
              <p className="text-xs font-medium text-textdark/50">
                Fuel Credit Left
              </p>
              <p
                className={`text-lg font-bold mt-1 ${
                  balances.weekly_fuel_available < 0
                    ? "text-error"
                    : "text-textdark"
                }`}
              >
                {formatMoney(balances.weekly_fuel_available, 2)}
              </p>
            </div>
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-grey/40 bg-offwhite px-4 py-3 text-sm text-textdark/80">
              Next payment due:{" "}
              <span className="font-semibold text-textdark">
                {formatDueDate(balances.next_payment_due)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-textdark/60 text-sm">
            No account details yet.
          </p>
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

      <section
        id="documents"
        className="bg-white border border-grey/40 rounded-2xl p-6 mt-6"
      >
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-navy" />
          <h2 className="text-lg font-semibold text-navy">My Documents</h2>
        </div>
        <div className="mt-4">
          <ClientDocumentsUpload
            documents={documents}
            contractDownloadUrl={contractDownloadUrl}
          />
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