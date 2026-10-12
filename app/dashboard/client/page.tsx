import Link from "next/link";
import { MapPin, LifeBuoy } from "lucide-react";
import { requireClient } from "@/lib/auth";
import {
  getClientLeadAndSubmissions,
  getClientRequiredActions,
  getClientBalances,
  getClientProgrammeContext,
  getClientAccountProfile,
  getClientDebtBreakdown,
} from "@/lib/data/client";
import { RequiredActions } from "@/app/components/dashboard/RequiredActions";
import { HeroProfileCard } from "@/app/components/dashboard/HeroProfileCard";
import { DebtBreakdown } from "@/app/components/dashboard/DebtBreakdown";
import { getWhatsAppLink } from "@/app/lib/site-config";

export default async function ClientHomePage() {
  const profile = await requireClient();
  const { lead, submissions } = await getClientLeadAndSubmissions(
    profile.user_id
  );
  const requiredActions = await getClientRequiredActions(profile.user_id);
  const balances = await getClientBalances(profile.user_id);
  const programme = await getClientProgrammeContext(profile.user_id);
  const accountProfile = await getClientAccountProfile(profile.user_id);
  const breakdown = await getClientDebtBreakdown(profile.user_id);
  const pending = submissions.find((s) => s.status === "pending" || s.status === "draft");

  const debtBuckets = breakdown
    ? [
        { key: "fuel", label: "Fuel", amount: breakdown.fuel },
        { key: "repair", label: "Repair", amount: breakdown.repair },
        { key: "rental", label: "Rental", amount: breakdown.rental },
        {
          key: "penalties",
          label: "Penalties & Adjustments",
          amount: breakdown.penalties,
        },
      ]
    : [];

  return (
    <div>
      <RequiredActions actions={requiredActions} />

      {!lead ? (
        <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
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
        </section>
      ) : null}

      <div className="mt-6">
        <HeroProfileCard
          fullName={profile.full_name}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          driverStatus={accountProfile?.driver_status ?? "pending"}
          carMakeModel={accountProfile?.car_make_model ?? null}
          carRegistration={accountProfile?.car_registration ?? null}
          fuelGarageName={accountProfile?.fuel_garage_name ?? null}
          fuelCode={accountProfile?.fuel_code ?? null}
          weeklyFuelAvailable={balances?.weekly_fuel_available ?? 0}
          weeklyFuelLimit={balances?.weekly_fuel_limit ?? 2000}
          primaryService={programme.primary_service}
          hasVehicle={programme.hasVehicle}
          vehicle={programme.vehicle}
        />
      </div>

      {debtBuckets.length > 0 ? (
        <div className="mt-6">
          <DebtBreakdown
            buckets={debtBuckets}
            total={breakdown?.total ?? 0}
            title="Weekly Account Summary"
            totalLabel="This Week's Total"
          />
        </div>
      ) : null}

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-navy">Applications</h2>
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

        <a
          href={getWhatsAppLink(
            "Hi Go Gro Mobility, I need support with my account."
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white border border-grey/40 rounded-2xl p-5 hover:border-orange transition-colors"
        >
          <LifeBuoy size={22} className="text-orange shrink-0" />
          <div>
            <p className="font-semibold text-textdark">Support Center</p>
            <p className="text-sm text-textdark/60">
              Chat with us on WhatsApp
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}