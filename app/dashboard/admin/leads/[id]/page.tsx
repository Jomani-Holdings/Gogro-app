import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLead, getAdminCommunications, getSubmissionsForLead } from "@/lib/data/admin";
import { getPublishedFormTemplates } from "@/lib/data/admin";
import { LeadStatusSelect } from "@/app/components/dashboard/LeadStatusSelect";
import { NoteForm } from "@/app/components/dashboard/NoteForm";
import { AssignFormModal } from "@/app/components/dashboard/AssignFormModal";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-textdark/50">{label}</dt>
      <dd className="text-textdark font-medium mt-0.5">{value || "—"}</dd>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getAdminLead(id);
  if (!lead) notFound();

  const [communications, submissions, forms] = await Promise.all([
    getAdminCommunications(id),
    getSubmissionsForLead(id),
    getPublishedFormTemplates(),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/admin/leads"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to leads
      </Link>

      <div className="flex items-start justify-between gap-4 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textdark">
          {lead.full_name}
        </h1>
        <AssignFormModal leadId={lead.id} forms={forms} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Contact</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Email" value={lead.email} />
              <Field label="Phone" value={lead.phone} />
              <Field label="Service" value={lead.service_name} />
              <Field label="Created" value={formatDate(lead.created_at)} />
            </dl>
            {lead.notes ? (
              <div className="mt-4 rounded-lg bg-grey/20 p-4 text-sm text-textdark/80">
                <p className="font-semibold mb-1">Notes</p>
                <p>{lead.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Application Submissions
            </h2>
            {submissions.length === 0 ? (
              <p className="text-textdark/60">
                No forms assigned yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {submissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-grey/40 p-4"
                  >
                    <div>
                      <p className="font-medium text-textdark">
                        {submission.template_name ?? "Application"}
                      </p>
                      <p className="text-sm text-textdark/60 capitalize">
                        {submission.status.replace(/_/g, " ")} ·{" "}
                        {formatDate(submission.submitted_at)}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/admin/submissions/${submission.id}`}
                      className="text-navy font-semibold hover:text-orange shrink-0"
                    >
                      Review &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Add note</h2>
            <NoteForm leadId={lead.id} />
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Communications
            </h2>
            {communications.length === 0 ? (
              <p className="text-textdark/60">No communications yet.</p>
            ) : (
              <ul className="space-y-4">
                {communications.map((comm) => (
                  <li
                    key={comm.id}
                    className="border-l-2 border-orange/40 pl-4"
                  >
                    <div className="flex items-center gap-2 text-xs text-textdark/50">
                      <span className="capitalize">{comm.type}</span>
                      <span>·</span>
                      <span className="capitalize">{comm.direction}</span>
                      <span>·</span>
                      <span>{formatDate(comm.sent_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-textdark mt-1">
                      {comm.subject ?? "—"}
                    </p>
                    {comm.body ? (
                      <p className="text-sm text-textdark/70 mt-1 break-all">
                        {comm.body}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <LeadStatusSelect id={lead.id} currentStatus={lead.status} />
        </aside>
      </div>
    </div>
  );
}