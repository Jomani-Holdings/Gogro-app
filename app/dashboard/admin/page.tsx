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

function StatusBreakdown({
  title,
  entries,
  emptyText,
}: {
  title: string;
  entries: [string, number][];
  emptyText: string;
}) {
  return (
    <div className="bg-white border border-grey/40 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-textdark">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-textdark/60 mt-3">{emptyText}</p>
      ) : (
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {entries.map(([status, count]) => (
            <div key={status} className="rounded-xl border border-grey/40 p-4">
              <dt className="text-sm text-textdark/60 capitalize">
                {status.replace(/_/g, " ")}
              </dt>
              <dd className="text-2xl font-bold text-navy mt-1">{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Overview</h1>
      <p className="text-textdark/60 mt-1">
        A snapshot of your leads, submissions, clients and catalogue.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Total Leads"
          value={stats.leads}
          href="/dashboard/admin/leads"
        />
        <StatCard
          label="Submissions"
          value={stats.submissions}
          href="/dashboard/admin/submissions"
        />
        <StatCard
          label="Clients"
          value={stats.drivers}
          href="/dashboard/admin/drivers"
        />
        <StatCard
          label="Published Services"
          value={stats.services}
          href="/dashboard/admin/services"
        />
      </div>

      <div className="space-y-6 mt-8">
        <StatusBreakdown
          title="Leads by status"
          entries={Object.entries(stats.byStatus)}
          emptyText="No leads yet."
        />
        <StatusBreakdown
          title="Submissions by status"
          entries={Object.entries(stats.bySubmissionStatus)}
          emptyText="No submissions yet."
        />
      </div>
    </div>
  );
}