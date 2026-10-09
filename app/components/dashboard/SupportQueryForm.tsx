"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { FileText, MessageCircle } from "lucide-react";
import {
  deletePaymentProof,
  uploadPaymentProof,
} from "@/app/dashboard/client/actions";
import { siteConfig } from "@/app/lib/site-config";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

const queryCategories = [
  {
    value: "breakdown",
    label: "Breakdown Assistance",
    starter: "My vehicle has broken down and I need immediate assistance.",
  },
  {
    value: "accident",
    label: "Report an Accident",
    starter: "I would like to report an accident and need guidance on next steps.",
  },
  {
    value: "account",
    label: "Account / Balance Question",
    starter: "I have a question about my account balance and transactions.",
  },
  {
    value: "account-deactivated",
    label: "Account Deactivated",
    starter:
      "My account has been deactivated. Please let me know why and how I can reactivate it.",
  },
  {
    value: "fuel",
    label: "Fuel Credit Issue",
    starter: "I have an issue with my fuel credit.",
  },
  {
    value: "payment",
    label: "Payment Issue",
    starter: "I need help making a payment or have a payment query.",
  },
  {
    value: "fuel-repayment",
    label: "Fuel Repayment",
    starter: "Hi, please find attached my payment for my fuel account.",
  },
  {
    value: "balance",
    label: "Balance settlement",
    starter: "I'd like to settle my outstanding balance.",
  },
  { value: "other", label: "Other", starter: "" },
] as const;

export function SupportQueryForm({
  fullName,
  phone,
  fuelCode,
  carMakeModel,
  carRegistration,
  isRental,
  rentalVehicle,
  whatsappNumber,
  defaultCategory,
  defaultMessage,
}: {
  fullName: string | null;
  phone: string | null;
  fuelCode: string | null;
  carMakeModel: string | null;
  carRegistration: string | null;
  isRental: boolean;
  rentalVehicle: { make_model: string; registration: string } | null;
  whatsappNumber: string;
  defaultCategory?: string | null;
  defaultMessage?: string | null;
}) {
  const initialCategory =
    defaultCategory &&
    queryCategories.some((c) => c.value === defaultCategory)
      ? defaultCategory
      : "breakdown";
  const [category, setCategory] = useState<string>(initialCategory);
  const [message, setMessage] = useState<string>(
    defaultMessage ??
      queryCategories.find((c) => c.value === initialCategory)?.starter ??
      ""
  );
  const [uploaded, setUploaded] = useState<{
    id: string;
    signedUrl: string;
    filename: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryLabel =
    queryCategories.find((c) => c.value === category)?.label ?? "Other";

  function onCategoryChange(value: string) {
    setCategory(value);
    setError(null);
    const starter =
      queryCategories.find((c) => c.value === value)?.starter ?? "";
    setMessage(starter);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (!selected) return;

    const previousId = uploaded?.id ?? null;
    const formData = new FormData();
    formData.append("file", selected);

    startUpload(async () => {
      const result = await uploadPaymentProof(formData);
      if (!result.ok || !result.id || !result.signedUrl) {
        setError(result.error ?? "Could not upload your proof of payment.");
        return;
      }
      if (previousId) {
        await deletePaymentProof(previousId);
      }
      setUploaded({
        id: result.id,
        signedUrl: result.signedUrl,
        filename: result.filename ?? selected.name,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function removeProof() {
    if (!uploaded) return;
    const id = uploaded.id;
    setError(null);
    startUpload(async () => {
      const result = await deletePaymentProof(id);
      if (!result.ok) {
        setError(result.error ?? "Could not remove the proof.");
        return;
      }
      setUploaded(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function buildWaLink(proofUrl?: string) {
    const identity = fullName?.trim() ?? "a driver";
    const details = isRental
      ? rentalVehicle?.make_model
        ? ` I'm driving ${rentalVehicle.make_model} (${rentalVehicle.registration}).`
        : ""
      : ` Fuel code: ${fuelCode ?? "—"}, Car: ${carRegistration ?? "—"}.`;
    const proof = proofUrl ? ` Proof of payment: ${proofUrl}` : "";
    const body = `Hi Go Gro Mobility, I'm ${identity}.${details} I need help with: ${categoryLabel}.${message.trim() ? ` ${message.trim()}` : ""}${proof}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(body)}`;
  }

  function send() {
    setError(null);

    if (category === "fuel-repayment" && !uploaded) {
      setError("Please upload your proof of payment first.");
      return;
    }

    window.open(buildWaLink(uploaded?.signedUrl), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-semibold text-navy">
        Chat with Support on WhatsApp
      </h2>
      <p className="text-sm text-textdark/60 mt-1">
        Pick a topic and we&apos;ll pre-fill your message so our team can help
        faster.
      </p>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
          <p className="text-xs font-medium text-textdark/50">Name</p>
          <p className="text-sm font-semibold text-textdark truncate">
            {fullName ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
          <p className="text-xs font-medium text-textdark/50">Phone</p>
          <p className="text-sm font-semibold text-textdark truncate">
            {phone ?? "—"}
          </p>
        </div>
        {isRental ? (
          <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
            <p className="text-xs font-medium text-textdark/50">
              Rental Vehicle
            </p>
            <p className="text-sm font-semibold text-textdark truncate">
              {rentalVehicle?.make_model ?? "—"}
              {rentalVehicle?.registration
                ? ` (${rentalVehicle.registration})`
                : ""}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
            <p className="text-xs font-medium text-textdark/50">Fuel Code</p>
            <p className="text-sm font-semibold text-textdark truncate">
              {fuelCode ?? "—"}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
          <p className="text-xs font-medium text-textdark/50">Car</p>
          <p className="text-sm font-semibold text-textdark truncate">
            {carMakeModel ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-grey/40 bg-offwhite px-3 py-2">
          <p className="text-xs font-medium text-textdark/50">Registration</p>
          <p className="text-sm font-semibold text-textdark truncate">
            {carRegistration ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>What do you need help with?</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={inputClass}
          >
            {queryCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Your message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={category === "other" ? "Type your query here…" : ""}
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      {category === "fuel-repayment" ? (
        <div className="mt-4">
          <label className={labelClass} htmlFor="payment-proof">
            Proof of payment
          </label>
          <input
            ref={fileInputRef}
            id="payment-proof"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileChange}
            disabled={uploading}
            className="w-full rounded-lg border border-grey/60 bg-white px-3 py-2 text-sm text-textdark file:mr-3 file:rounded-md file:border-0 file:bg-navy/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-navy/20 disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-textdark/50">
            PDF, JPG or PNG up to 5MB.
          </p>

          {uploading ? (
            <p className="mt-3 text-sm text-textdark/60">Uploading…</p>
          ) : null}

          {uploaded && !uploading ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-grey/40 bg-offwhite p-3">
              <div className="flex min-w-0 items-center gap-3">
                {/\.(png|jpe?g)$/i.test(uploaded.filename) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploaded.signedUrl}
                    alt={uploaded.filename}
                    className="h-16 w-16 shrink-0 rounded-lg border border-grey/40 object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-grey/40 text-textdark/50">
                    <FileText size={22} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textdark">
                    {uploaded.filename}
                  </p>
                  <p className="text-xs font-medium text-success">Uploaded</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeProof}
                disabled={uploading}
                className="shrink-0 text-xs font-semibold text-error hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={send}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-success text-white font-semibold py-3 px-6 hover:bg-success/90 disabled:opacity-60"
        >
          <MessageCircle size={18} />
          Send on WhatsApp
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      <p className="mt-4 text-sm text-textdark/60">
        Prefer email? Contact{" "}
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-semibold text-navy underline"
        >
          {siteConfig.email}
        </a>
      </p>
    </section>
  );
}
