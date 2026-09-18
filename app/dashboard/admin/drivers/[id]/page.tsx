import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminDriver,
  getAdminGarageOptions,
  getAdminLeadByUserId,
  getAdminDriverVehicles,
  getDriverTransactions,
} from "@/lib/data/admin";
import { getDocumentsForUser } from "@/lib/data/documents";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { DriverForm } from "@/app/components/dashboard/DriverForm";
import { DocumentsManager } from "@/app/components/dashboard/DocumentsManager";
import { RequestDocumentsModal } from "@/app/components/dashboard/RequestDocumentsModal";
import { Accordion } from "@/app/components/dashboard/Accordion";
import { LogTransactionModal } from "@/app/components/dashboard/LogTransactionModal";
import { SuspendDriverButton } from "@/app/components/dashboard/SuspendDriverButton";
import { TRANSACTION_LABELS } from "@/lib/data/types";

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

export default async function AdminDriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getAdminDriver(id);
  if (!driver) notFound();

  const [garages, documents, lead, vehicles, transactions] =
    await Promise.all([
      getAdminGarageOptions(),
      getDocumentsForUser(driver.user_id),
      getAdminLeadByUserId(driver.user_id),
      getAdminDriverVehicles(driver.id),
      getDriverTransactions(driver.id, 10),
    ]);

  return (
    <div>
      <Link
        href="/dashboard/admin/drivers"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to drivers
      </Link>

      <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            {driver.full_name ?? "Driver"}
          </h1>
          <p className="text-textdark/60 mt-1">{driver.email ?? "—"}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              statusStyles[driver.driver_status] ?? statusStyles.pending
            }`}
          >
            {statusLabels[driver.driver_status] ?? "Pending"}
          </span>
          {driver.suspended ? (
            <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold bg-error/10 text-error">
              Suspended
            </span>
          ) : null}
          {driver.is_overdue ? (
            <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold bg-error text-white">
              OVERDUE
            </span>
          ) : null}
          <LogTransactionModal
            driverId={driver.id}
            driverName={driver.full_name}
            driver={driver}
            vehicles={vehicles}
            garages={garages}
            triggerLabel="Log Transaction"
            triggerClassName="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-2.5 px-4 hover:bg-navy/5"
          />
          <SuspendDriverButton
            profileId={driver.id}
            suspended={driver.suspended}
          />
        </div>
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
          <Field label="ID / Passport Number" value={driver.id_number} />
          <Field label="Area / Suburb" value={driver.suburb} />
          <Field label="Valid License (PrDP)" value={driver.license_valid} />
          <Field label="eHailing Experience" value={driver.years_experience} />
          <Field
            label="Preferred Vehicle Category"
            value={driver.preferred_vehicle_category}
          />
          <Field label="Marketing Source" value={driver.marketing_source} />
          <Field label="Primary Service" value={driver.primary_service} />
          <Field
            label="Fuel Credit"
            value={formatMoney(driver.weekly_fuel_limit, 2)}
          />
          <Field
            label="Fuel Used This Cycle"
            value={formatMoney(driver.weekly_fuel_issued, 2)}
          />
          <Field
            label="Fuel Credit Left"
            value={formatMoney(driver.weekly_fuel_available, 2)}
          />
          <Field
            label="Driver Balance"
            value={formatMoney(driver.driver_balance, 2)}
          />
          <Field
            label="Next Payment Due"
            value={
              driver.next_payment_due
                ? formatDateTime(driver.next_payment_due)
                : null
            }
          />
          <Field
            label="Payment Arrangement"
            value={
              driver.payment_arrangement_due_date
                ? `Due ${formatDate(driver.payment_arrangement_due_date)}${
                    driver.payment_arrangement_notes
                      ? ` — ${driver.payment_arrangement_notes}`
                      : ""
                  }`
                : null
            }
          />
          <Field label="Fuel Code" value={driver.fuel_code} />
          <Field label="Fuel Garage" value={driver.fuel_garage_name} />
          <Field
            label="Activity Status"
            value={statusLabels[driver.driver_status] ?? driver.driver_status}
          />
          <Field label="Suspended" value={driver.suspended ? "Yes" : "No"} />
        </dl>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Edit driver details
          </h2>
          <DriverForm driver={driver} isNew={false} garages={garages} vehicles={vehicles} />
        </section>

        <Accordion
          title="Documents"
          badge={
            documents.some((doc) => doc.status === "pending")
              ? `${documents.filter((doc) => doc.status === "pending").length} pending`
              : null
          }
          actions={
            lead?.id ? (
              <RequestDocumentsModal
                leadId={lead.id}
                userId={driver.user_id}
                existingCategories={documents.map((doc) => doc.category)}
              />
            ) : undefined
          }
        >
          <DocumentsManager
            leadId={lead?.id ?? null}
            userId={driver.user_id}
            documents={documents}
            hideHeading
          />
        </Accordion>
      </div>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-navy mb-4">
          Recent Transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="text-textdark/50 text-sm">
            No transactions logged yet for this driver.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="hidden md:table-cell px-3 py-2 font-medium">
                    Vehicle
                  </th>
                  <th className="hidden md:table-cell px-3 py-2 font-medium">
                    Garage
                  </th>
                  <th className="px-3 py-2 font-medium">Litres</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-grey/20 last:border-0"
                  >
                    <td className="px-3 py-2 text-textdark/70">
                      {formatDateTime(tx.created_at)}
                    </td>
                    <td className="px-3 py-2 text-textdark font-medium">
                      {TRANSACTION_LABELS[tx.type] ?? tx.type}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2 text-textdark/70">
                      {tx.vehicle_name ?? "—"}
                    </td>
                    <td className="hidden md:table-cell px-3 py-2 text-textdark/70">
                      {tx.garage_name ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-textdark/70">
                      {tx.litres !== null ? `${tx.litres} L` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-textdark">
                      {formatMoney(tx.amount, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}