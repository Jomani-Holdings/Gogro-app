import { getPublicForm } from "@/lib/data/apply-public";
import { renderRichText } from "@/lib/tiptap/render";
import { PublicFormPortal } from "@/app/components/apply/PublicFormPortal";
import { documentUrl } from "@/lib/media";

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ submissionId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ submissionId }, { token }] = await Promise.all([params, searchParams]);

  if (!token) {
    return <InvalidLink />;
  }

  const payload = await getPublicForm(submissionId, token);
  if (!payload) {
    return <InvalidLink />;
  }

  const introHtml = renderRichText(payload.template.intro_content);
  const termsHtml = renderRichText(payload.template.terms_content);
  const contractPath = payload.template.contract_document_path;

  const initialData: Record<string, unknown> = {
    fullName: payload.lead.full_name || "",
    email: payload.lead.email || "",
    phone: payload.lead.phone || "",
    ...payload.data,
  };

  const alreadySubmitted = payload.status === "submitted";

  return (
    <section className="container mx-auto px-6 md:px-12 py-16 md:py-20 max-w-3xl">
      {introHtml ? (
        <div
          className="prose prose-lg max-w-none mb-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_p]:mt-3 [&_a]:text-orange [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : undefined}

      {contractPath ? (
        <div className="mb-8 rounded-2xl border border-navy/20 bg-navy/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy">
              Sign your contract
            </h2>
            <p className="text-sm text-textdark/70 mt-1">
              Download the contract, sign it, and upload the signed copy to
              your dashboard.
            </p>
          </div>
          <a
            href={`${documentUrl(contractPath)}?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-6 hover:bg-navy/90 shrink-0"
          >
            Download Contract
          </a>
        </div>
      ) : undefined}

      <PublicFormPortal
        submissionId={submissionId}
        token={token}
        fields={payload.template.field_schema}
        garages={payload.garages}
        initialData={initialData}
        termsHtml={termsHtml}
        alreadySubmitted={alreadySubmitted}
        confirmationMessage={
          payload.template.confirmation_message ?? undefined
        }
      />
    </section>
  );
}

function InvalidLink() {
  return (
    <section className="container mx-auto px-6 md:px-12 py-24 max-w-2xl">
      <div className="bg-white border border-grey/40 rounded-2xl p-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-textdark">
          This link is invalid or has expired
        </h1>
        <p className="text-textdark/70 mt-3">
          Please contact the Go Gro team to receive a fresh application link.
        </p>
      </div>
    </section>
  );
}