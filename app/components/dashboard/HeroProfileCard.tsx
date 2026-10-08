import { formatMoney } from "@/lib/utils";
import { AvatarEditor } from "@/app/components/dashboard/AvatarEditor";

export type HeroProfileCardProps = {
  fullName: string | null;
  email: string | null;
  driverStatus: string;
  carMakeModel: string | null;
  carRegistration: string | null;
  fuelGarageName: string | null;
  fuelCode: string | null;
  weeklyFuelAvailable: number;
  weeklyFuelLimit: number;
  primaryService: string | null;
  hasVehicle: boolean;
  vehicle: { make_model: string; registration: string } | null;
  avatarUrl: string | null;
};

function statusInfo(status: string): { label: string; dot: string } {
  if (status === "active") return { label: "Active", dot: "bg-success" };
  if (status === "suspended") return { label: "Suspended", dot: "bg-error" };
  if (status === "inactive") return { label: "Inactive", dot: "bg-error" };
  if (status === "pending") return { label: "Pending", dot: "bg-yellow" };
  return { label: status.charAt(0).toUpperCase() + status.slice(1), dot: "bg-grey" };
}

function StripItem({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 ${className}`}>
      <p className="text-xs font-medium text-textdark/50">{label}</p>
      <div className="text-sm font-semibold text-textdark mt-0.5">{children}</div>
    </div>
  );
}

export function HeroProfileCard({
  fullName,
  email,
  driverStatus,
  carMakeModel,
  carRegistration,
  fuelGarageName,
  fuelCode,
  weeklyFuelAvailable,
  weeklyFuelLimit,
  primaryService,
  hasVehicle,
  vehicle,
  avatarUrl,
}: HeroProfileCardProps) {
  const isRental = primaryService === "vehicle-rental";
  const status = statusInfo(driverStatus);

  return (
    <section className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-4">
          <AvatarEditor
            avatarStoragePath={avatarUrl}
            fullName={fullName}
            size="md"
          />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-textdark">
              {fullName ?? "Go Gro Driver"}
            </h2>
            <p className="text-sm text-textdark/60">Go Gro Driver</p>
            {email ? (
              <p className="text-xs text-textdark/50 mt-0.5">{email}</p>
            ) : null}
          </div>
        </div>

        {!isRental ? (
          <div className="rounded-xl border border-orange/40 bg-orange/5 px-6 py-4 text-center shrink-0">
            <p className="text-xs font-semibold text-orange uppercase tracking-wide">
              Available Credit
            </p>
            <p className="text-2xl font-bold text-textdark mt-1">
              {formatMoney(weeklyFuelAvailable, 2)}
            </p>
            <p className="text-xs text-textdark/50 mt-0.5">
              Weekly credit: {formatMoney(weeklyFuelLimit, 2)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-grey/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-grey/40">
        <StripItem label="Current Status">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </StripItem>

        {isRental ? (
          hasVehicle ? (
            <>
              <StripItem label="Rental Vehicle" className="col-span-2 sm:col-span-3 lg:col-span-4">
                <span>{vehicle?.make_model ?? "—"}</span>
                {vehicle?.registration ? (
                  <span className="ml-2 font-medium text-textdark/60">
                    {vehicle.registration}
                  </span>
                ) : null}
              </StripItem>
            </>
          ) : (
            <StripItem label="Rental Vehicle" className="col-span-2 sm:col-span-3 lg:col-span-4">
              <span className="text-orange">Pending Vehicle Assignment</span>
            </StripItem>
          )
        ) : (
          <>
            <StripItem label="Car Details">{carMakeModel ?? "—"}</StripItem>
            <StripItem label="Car Registration">
              {carRegistration ?? "—"}
            </StripItem>
            <StripItem label="Fuel Garage">{fuelGarageName ?? "—"}</StripItem>
            <StripItem label="Fuel Code">{fuelCode ?? "—"}</StripItem>
          </>
        )}
      </div>
    </section>
  );
}