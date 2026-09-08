import { getPublicForm } from "@/lib/data/apply-public";
import { renderRichText } from "@/lib/tiptap/render";
import { PublicFormPortal } from "@/app/components/apply/PublicFormPortal";

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