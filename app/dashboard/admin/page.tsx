import Link from "next/link";
import { getAdminStats } from "@/lib/data/admin";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-grey/40 rounded-2xl p-6 hover:border-orange transition-colors"
    >
      <p className="text-sm text-textdark/60">{label}</p>
      <p className="text-4xl font-bold text-navy mt-2">{value}</p>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const statusEntries = Object.entries(stats.byStatus);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Overview</h1>
      <p className="text-textdark/60 mt-1">
        A snapshot of your applications, drivers, and catalogue.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Total Applications"
          value={stats.applications}
          href="/dashboard/admin/applications"
        />
        <StatCard
          label="Drivers"
          value={stats.drivers}
          href="/dashboard/admin/drivers"
        />
        <StatCard
          label="Active Garages"
          value={stats.garages}
          href="/dashboard/admin/garages"
        />
        <StatCard
          label="Published Services"
          value={stats.services}
          href="/dashboard/admin/services"
        />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-textdark">
          Applications by status
        </h2>
        {statusEntries.length === 0 ? (
          <p className="text-textdark/60 mt-3">No applications yet.</p>
        ) : (
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {statusEntries.map(([status, count]) => (
              <div
                key={status}
                className="rounded-xl border border-grey/40 p-4"
              >
                <dt className="text-sm text-textdark/60 capitalize">
                  {status.replace(/_/g, " ")}
                </dt>
                <dd className="text-2xl font-bold text-navy mt-1">{count}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
