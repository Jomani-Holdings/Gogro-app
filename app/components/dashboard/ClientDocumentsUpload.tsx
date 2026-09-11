"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { uploadClientDocument } from "@/app/dashboard/client/actions";
import { DOCUMENT_CATEGORIES, type Document } from "@/lib/data/types";
import { documentUrl } from "@/lib/media";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

const statusLabels: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export function ClientDocumentsUpload({
  documents,
  contractDownloadUrl,
}: {
  documents: Document[];
  contractDownloadUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function docsFor(category: string) {
    return documents.filter((doc) => doc.category === category);
  }

  function handleFile(category: string, file: File | undefined) {
    setError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File is larger than the 5MB limit.");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setError("Only PDF, JPG or PNG files are allowed.");
      return;
    }

    setUploading(category);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("file", file);
      const result = await uploadClientDocument(formData);
      if (!result.ok) setError(result.error ?? "Upload failed.");
      setUploading(null);
      router.refresh();
    });
  }

  return (
    <div>
      {contractDownloadUrl ? (
        <div className="mb-6 rounded-2xl border border-navy/20 bg-navy/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-navy">Sign your contract</h3>
            <p className="text-sm text-textdark/70 mt-1">
              Download the contract, sign it, and upload it in the “Signed
              Contract” section below.
            </p>
          </div>
          <a
            href={documentUrl(contractDownloadUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-6 hover:bg-navy/90 shrink-0"
          >
            Download Contract
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {DOCUMENT_CATEGORIES.map((category) => {
          const uploaded = docsFor(category.value);
          return (
            <div
              key={category.value}
              className="rounded-xl border border-grey/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-textdark">
                    {category.label}
                  </p>
                  <p className="text-sm text-textdark/60">
                    {category.description}
                  </p>
                </div>
                {uploaded.length > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    {uploaded.map((doc) => (
                      <span
                        key={doc.id}
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusStyles[doc.status] ?? statusStyles.pending
                        }`}
                      >
                        {statusLabels[doc.status] ?? "Pending"}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {uploaded.length === 0 ? (
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-navy text-navy text-sm font-semibold py-2 px-4 hover:bg-navy/5 cursor-pointer">
                    <Upload size={16} />
                    Upload
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="hidden"
                      disabled={pending}
                      onChange={(e) =>
                        handleFile(category.value, e.target.files?.[0])
                      }
                    />
                  </label>
                  {uploading === category.value ? (
                    <span className="ml-3 text-sm text-textdark/60">
                      Uploading…
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {uploaded.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-offwhite px-3 py-2"
                    >
                      <a
                        href={documentUrl(doc.storage_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-navy hover:text-orange underline break-all"
                      >
                        {doc.filename}
                      </a>
                      <label className="inline-flex items-center gap-2 rounded-lg border border-navy text-navy text-xs font-semibold py-1.5 px-3 hover:bg-navy/5 cursor-pointer">
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          className="hidden"
                          disabled={pending}
                          onChange={(e) =>
                            handleFile(category.value, e.target.files?.[0])
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}