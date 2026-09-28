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
  garageNames,
  label = "Download PDF",
}: {
  submission: FormSubmission;
  fields: FormField[];
  garageNames?: Record<string, string>;
  label?: string;
}) {
  return (
    <SubmissionPdfDownloadLink
      submission={submission}
      fields={fields}
      garageNames={garageNames}
      label={label}
    />
  );
}