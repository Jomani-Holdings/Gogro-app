import { siteConfig } from "@/app/lib/site-config";
import { requireClient } from "@/lib/auth";
import {
  getClientAccountProfile,
  getClientBalances,
  getClientProgrammeContext,
} from "@/lib/data/client";
import { BankingDetailsTile } from "@/app/components/dashboard/BankingDetailsTile";
import { SupportQueryForm } from "@/app/components/dashboard/SupportQueryForm";

export default async function DriverSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireClient();
  const [accountProfile, balances, programme] = await Promise.all([
    getClientAccountProfile(profile.user_id),
    getClientBalances(profile.user_id),
    getClientProgrammeContext(profile.user_id),
  ]);

  const params = await searchParams;
  const defaultCategory =
    typeof params.category === "string" ? params.category : null;
  const defaultMessage =
    typeof params.message === "string" ? params.message : null;

  const isRental = programme.primary_service === "vehicle-rental";

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Support</h1>
      <p className="text-textdark/60 mt-1">
        One-tap access to the help you need, when you need it.
      </p>

      <div className="mt-8">
        <BankingDetailsTile
          fullName={accountProfile?.full_name ?? profile.full_name}
          fuelCode={accountProfile?.fuel_code ?? null}
          outstandingBalance={balances?.fuel_balance ?? 0}
        />
      </div>

      <div id="support-form" className="scroll-mt-24">
        <SupportQueryForm
          key={`support-form-${defaultCategory ?? ""}-${defaultMessage ?? ""}`}
          fullName={profile.full_name}
          phone={profile.phone}
          fuelCode={accountProfile?.fuel_code ?? null}
          carMakeModel={accountProfile?.car_make_model ?? null}
          carRegistration={accountProfile?.car_registration ?? null}
          isRental={isRental}
          rentalVehicle={programme.vehicle}
          whatsappNumber={siteConfig.whatsapp.number}
          defaultCategory={defaultCategory}
          defaultMessage={defaultMessage}
        />
      </div>
    </div>
  );
}
