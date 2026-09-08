"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import type { FormField, FormSubmission } from "@/lib/data/types";
import { SubmissionPdfDocument } from "@/app/components/dashboard/SubmissionPdfDocument";

export function SubmissionPdfDownloadLink({
  submission,
  fields,
  label,
}: {
  submission: FormSubmission;
  fields: FormField[];
  label: string;
}) {
  const fileName = `${submission.full_name ?? "client"}-${
    submission.template_name ?? "application"
  }.pdf`
    .replace(/\s+/g, "-")
    .toLowerCase();

  return (
    <PDFDownloadLink
      document={<SubmissionPdfDocument submission={submission} fields={fields} />}
      fileName={fileName}
      className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-5 transition-colors hover:bg-navy/90"
    >
      {label}
    </PDFDownloadLink>
  );
}