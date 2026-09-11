import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminSubmission,
  getAdminFormTemplate,
  getAdminLead,
} from "@/lib/data/admin";
import { getDocumentsForLead } from "@/lib/data/documents";
import { SubmissionStatusActions } from "@/app/components/dashboard/SubmissionStatusActions";
import { SubmissionPdfDownload } from "@/app/components/dashboard/SubmissionPdfDownload";
import { DocumentsManager } from "@/app/components/dashboard/DocumentsManager";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getAdminSubmission(id);
  if (!submission) notFound();

  const [template, lead, documents] = await Promise.all([
    getAdminFormTemplate(submission.form_template_id),
    getAdminLead(submission.lead_id),
    getDocumentsForLead(submission.lead_id),
  ]);
  const fields =
    template?.field_schema.filter(
      (field) => submission.data[field.key] !== undefined
    ) ?? [];
  const data = submission.data;

  const labelFor = (key: string): string => {
    const field = template?.field_schema.find((f) => f.key === key);
    return field?.label ?? key.replace(/([A-Z])/g, " $1").trim();
  };

  const display = (key: string): string => {
    const value = data[key];
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const keys = Object.keys(data);

  return (
    <div>
      <Link
        href="/dashboard/admin/submissions"
        className="text-sm text-navy hover:text-orange font-medium"
      >
        &larr; Back to submissions
      </Link>

      <div className="flex items-start justify-between gap-4 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            {submission.full_name ?? "Unnamed client"}
          </h1>
          <p className="text-textdark/60 mt-1">
            {submission.template_name ?? "Application"} · submitted{" "}
            {formatDate(submission.submitted_at)}
          </p>
        </div>
        {keys.length > 0 && (
          <SubmissionPdfDownload submission={submission} fields={fields} />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <section className="bg-white border border-grey/40 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">
              Application details
            </h2>
            {keys.length === 0 ? (
              <p className="text-textdark/60">No data recorded.</p>
            ) : (
              <dl className="divide-y divide-grey/20">
                {keys.map((key) => (
                  <div
                    key={key}
                    className="grid sm:grid-cols-3 gap-2 py-3"
                  >
                    <dt className="sm:col-span-1 text-sm text-textdark/60">
                      {labelFor(key)}
                    </dt>
                    <dd className="sm:col-span-2 text-textdark font-medium break-words">
                      {display(key)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
            <DocumentsManager
              leadId={submission.lead_id}
              userId={lead?.user_id ?? ""}
              documents={documents}
            />
          </section>

          <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-navy mb-3">Raw data</h2>
            <pre className="overflow-x-auto rounded-lg bg-grey/20 p-4 text-xs text-textdark/80">
              {JSON.stringify(submission.data, null, 2)}
            </pre>
          </section>
        </div>

        <aside className="bg-white border border-grey/40 rounded-2xl p-6 h-fit">
          <SubmissionStatusActions id={submission.id} currentStatus={submission.status} />
        </aside>
      </div>
    </div>
  );
}