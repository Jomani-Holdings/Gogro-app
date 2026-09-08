"use client";

import dynamic from "next/dynamic";
import type { FormField, FormSubmission } from "@/lib/data/types";

const SubmissionPdfDownloadLink = dynamic(
  () =>
    import("@/app/components/dashboard/SubmissionPdfDownloadLink").then(
      (m) => m.SubmissionPdfDownloadLink
    ),
  { ssr: false }
);

export function SubmissionPdfDownload({
  submission,
  fields,
  label = "Download PDF",
}: {
  submission: FormSubmission;
  fields: FormField[];
  label?: string;
}) {
  return (
    <SubmissionPdfDownloadLink
      submission={submission}
      fields={fields}
      label={label}
    />
  );
}