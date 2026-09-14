import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminVehicle, getAdminVehicleDriverOptions } from "@/lib/data/admin";
import { VehicleForm } from "@/app/components/dashboard/VehicleForm";
import { DeleteVehicleButton } from "@/app/components/dashboard/DeleteVehicleButton";

const statusMeta: Record<string, { label: string; dot: string; badge: string }> = {
  active: { label: "Active", dot: "bg-success", badge: "bg-success/10 text-success" },
  maintenance: { label: "Maintenance", dot: "bg-yellow", badge: "bg-yellow/20 text-textdark" },
  off_road: { label: "Off-Road", dot: "bg-error", badge: "bg-error/10 text-error" },
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-textdark/50">{label}</dt>
      <dd className="text-textdark font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getAdminVehicle(id);
  if (!vehicle) notFound();

  const drivers = await getAdminVehicleDriverOptions();
  const meta = statusMeta[vehicle.status] ?? statusMeta.active;

  return (
    <div>
      <Link
        href="/dashboard/admin/vehicles"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to vehicles
      </Link>

      <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            {vehicle.make_model}
          </h1>
          <p className="text-textdark/60 mt-1">{vehicle.registration}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${meta.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Summary</h2>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <Field label="Make / Model" value={vehicle.make_model} />
          <Field label="Registration" value={vehicle.registration} />
          <Field label="Driver" value={vehicle.driver_name} />
          <Field label="Owner" value={vehicle.owner_name} />
          <Field label="Category" value={vehicle.category} />
          <Field label="Ownership" value={vehicle.ownership_type} />
          <Field label="Weekly Rental" value={formatMoney(vehicle.weekly_rental)} />
          <Field label="Date Added" value={formatDate(vehicle.created_at)} />
          <Field label="Last Updated" value={formatDate(vehicle.updated_at)} />
        </dl>
      </div>

      <div className="mt-6 max-w-3xl">
        <section className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Edit vehicle details
          </h2>
          <VehicleForm vehicle={vehicle} drivers={drivers} isNew={false} />
        </section>

        <section className="mt-6 bg-white border border-error/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-error">Danger zone</h2>
          <p className="text-textdark/60 mt-1 mb-4">
            Removing this vehicle from the fleet is permanent.
          </p>
          <DeleteVehicleButton vehicleId={vehicle.id} />
        </section>
      </div>
    </div>
  );
}