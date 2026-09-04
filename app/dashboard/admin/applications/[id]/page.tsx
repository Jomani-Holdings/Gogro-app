import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminApplication } from "@/lib/data/admin";
import { ApplicationStatusActions } from "@/app/components/dashboard/ApplicationStatusActions";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-textdark/50">{label}</dt>
      <dd className="text-textdark font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getAdminApplication(id);

  if (!application) notFound();

  return (
    <div>
      <Link
        href="/dashboard/admin/applications"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to applications
      </Link>

      <div className="flex items-start justify-between gap-4 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textdark">
          {application.full_name ?? "Unnamed applicant"}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Personal Information
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Email" value={application.email} />
              <Field label="Contact Number" value={application.contact_number} />
              <Field label="ID / Passport" value={application.id_or_passport_number} />
              <Field label="Physical Address" value={application.physical_address} />
              <Field
                label="Car Make / Model / Year"
                value={application.car_make_model_year}
              />
              <Field
                label="Car Registration"
                value={application.car_registration_number}
              />
            </dl>
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Fuel Usage</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field
                label="eHailing Platform"
                value={
                  application.ehailing_platform === "Other"
                    ? application.ehailing_platform_other
                    : application.ehailing_platform
                }
              />
              <Field label="Driver Type" value={application.driver_type} />
              <Field label="Garage" value={application.garage_name} />
              <Field
                label="Weekly Credit"
                value={application.weekly_credit_band}
              />
            </dl>
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              References &amp; Marketing
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Heard About Us" value={application.heard_about_us} />
              <Field label="Reference" value={application.reference_name} />
              <Field
                label="Deposit Required"
                value={application.deposit_required ? "Yes (50%)" : "No"}
              />
            </dl>
          </section>
        </div>

        <aside className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <ApplicationStatusActions
            id={application.id}
            currentStatus={application.status}
          />
        </aside>
      </div>
    </div>
  );
}
