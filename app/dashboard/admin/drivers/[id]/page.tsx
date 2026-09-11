import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminDriver,
  getAdminGarageOptions,
  getAdminLeadByUserId,
} from "@/lib/data/admin";
import { getDocumentsForUser } from "@/lib/data/documents";
import { DriverForm } from "@/app/components/dashboard/DriverForm";
import { DocumentsManager } from "@/app/components/dashboard/DocumentsManager";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  active: "bg-success/10 text-success",
  suspended: "bg-error/10 text-error",
  inactive: "bg-grey/40 text-textdark",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  inactive: "Inactive",
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

export default async function AdminDriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getAdminDriver(id);
  if (!driver) notFound();

  const [garages, documents, lead] = await Promise.all([
    getAdminGarageOptions(),
    getDocumentsForUser(driver.user_id),
    getAdminLeadByUserId(driver.user_id),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/admin/drivers"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to drivers
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textdark">
          {driver.full_name ?? "Driver"}
        </h1>
        <p className="text-textdark/60 mt-1">{driver.email ?? "—"}</p>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-lg font-semibold text-navy">Summary</h2>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              statusStyles[driver.driver_status] ?? statusStyles.pending
            }`}
          >
            {statusLabels[driver.driver_status] ?? "Pending"}
          </span>
        </div>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <Field label="Name" value={driver.full_name} />
          <Field label="Phone" value={driver.phone} />
          <Field label="Email" value={driver.email} />
          <Field label="Date Created" value={formatDate(driver.created_at)} />
          <Field label="Car Make / Model" value={driver.car_make_model} />
          <Field label="Car Registration" value={driver.car_registration} />
          <Field
            label="Credit Limit"
            value={formatMoney(driver.credit_limit)}
          />
          <Field label="Fuel Balance" value={formatMoney(driver.fuel_balance)} />
          <Field label="Fuel Code" value={driver.fuel_code} />
          <Field label="Fuel Garage" value={driver.fuel_garage_name} />
          <Field
            label="Activity Status"
            value={statusLabels[driver.driver_status] ?? driver.driver_status}
          />
        </dl>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Edit driver details
          </h2>
          <DriverForm driver={driver} isNew={false} garages={garages} />
        </section>

        <section className="bg-white border border-grey/40 rounded-2xl p-6">
          <DocumentsManager
            leadId={lead?.id ?? null}
            userId={driver.user_id}
            documents={documents}
          />
        </section>
      </div>
    </div>
  );
}