"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  uploadDocument,
  setDocumentStatus,
  deleteDocument,
} from "@/app/dashboard/admin/documents/actions";
import { RequestDocumentsModal } from "@/app/components/dashboard/RequestDocumentsModal";
import { DOCUMENT_CATEGORIES, type Document } from "@/lib/data/types";
import { documentUrl, MAX_DOCUMENT_FILE_SIZE } from "@/lib/media";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  approved: "bg-success/10 text-success",
  rejected: "bg-error/10 text-error",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function DocumentsManager({
  leadId,
  userId,
  documents,
}: {
  leadId: string | null;
  userId: string | null;
  documents: Document[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function docsFor(category: string) {
    return documents.filter((doc) => doc.category === category);
  }

  function handleFile(category: string, file: File | undefined) {
    setUploadError(null);
    if (!file) return;
    if (file.size > MAX_DOCUMENT_FILE_SIZE) {
      setUploadError("File is larger than the 2MB limit.");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setUploadError("Only PDF, JPG or PNG files are allowed.");
      return;
    }

    setUploadingCategory(category);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("lead_id", leadId ?? "");
      formData.append("user_id", userId ?? "");
      formData.append("category", category);
      formData.append("file", file);
      try {
        const result = await uploadDocument(formData);
        if (!result.ok) setUploadError(result.error ?? "Upload failed.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed.";
        if (message.toLowerCase().includes("body exceeded")) {
          setUploadError(
            "File is too large. Please upload a file under 2MB."
          );
        } else {
          setUploadError(message);
        }
      }
      setUploadingCategory(null);
      if (fileRefs.current[category]) fileRefs.current[category]!.value = "";
      router.refresh();
    });
  }

  function changeStatus(id: string, status: "pending" | "approved" | "rejected") {
    setUploadError(null);
    startTransition(async () => {
      try {
        const result = await setDocumentStatus(id, status);
        if (!result.ok) setUploadError(result.error ?? "Something went wrong.");
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this document?")) return;
    setUploadError(null);
    startTransition(async () => {
      try {
        const result = await deleteDocument(id);
        if (!result.ok) setUploadError(result.error ?? "Something went wrong.");
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-navy">Documents</h2>
        {leadId && userId ? (
          <RequestDocumentsModal
            leadId={leadId}
            userId={userId}
            existingCategories={documents.map((doc) => doc.category)}
          />
        ) : null}
      </div>

      {uploadError ? (
        <p className="mb-4 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {uploadError}
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
                      <div key={doc.id} className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusStyles[doc.status] ?? statusStyles.pending
                          }`}
                        >
                          {statusLabels[doc.status] ?? "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {uploaded.length === 0 ? (
                <div className="mt-3">
                  <label className="inline-flex items-center justify-center rounded-lg border border-navy text-navy text-sm font-semibold py-2 px-4 hover:bg-navy/5 cursor-pointer">
                    Upload on behalf
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="hidden"
                      disabled={pending}
                      ref={(el) => {
                        fileRefs.current[category.value] = el;
                      }}
                      onChange={(e) => handleFile(category.value, e.target.files?.[0])}
                    />
                  </label>
                  {uploadingCategory === category.value ? (
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
                      <div className="flex items-center gap-2">
                        {doc.status !== "approved" ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => changeStatus(doc.id, "approved")}
                            className="text-xs font-semibold text-success hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>
                        ) : null}
                        {doc.status !== "rejected" ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => changeStatus(doc.id, "rejected")}
                            className="text-xs font-semibold text-error hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => remove(doc.id)}
                          className="text-xs font-semibold text-textdark/50 hover:text-error disabled:opacity-50"
                        >
                          Delete
                        </button>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          className="hidden"
                          id={`replace-${doc.id}`}
                          onChange={(e) =>
                            handleFile(category.value, e.target.files?.[0])
                          }
                        />
                        <label
                          htmlFor={`replace-${doc.id}`}
                          className="text-xs font-semibold text-navy hover:text-orange cursor-pointer"
                        >
                          Replace
                        </label>
                      </div>
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