"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

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
    value: "balance",
    label: "Balance settlement",
    starter: "I'd like to settle my outstanding balance.",
  },
  { value: "other", label: "Other", starter: "" },
] as const;

export function SupportQueryForm({
  fullName,
  phone,
  email,
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
  email: string | null;
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

  const categoryLabel =
    queryCategories.find((c) => c.value === category)?.label ?? "Other";

  function onCategoryChange(value: string) {
    setCategory(value);
    const starter =
      queryCategories.find((c) => c.value === value)?.starter ?? "";
    setMessage(starter);
  }

  const waLink = useMemo(() => {
    const identity = fullName?.trim() ?? "a driver";
    const details = isRental
      ? rentalVehicle?.make_model
        ? ` I'm driving ${rentalVehicle.make_model} (${rentalVehicle.registration}).`
        : ""
      : ` Fuel code: ${fuelCode ?? "—"}, Car: ${carRegistration ?? "—"}.`;
    const body = `Hi Go Gro Mobility, I'm ${identity}.${details} I need help with: ${categoryLabel}.${message.trim() ? ` ${message.trim()}` : ""}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(body)}`;
  }, [
    fullName,
    isRental,
    rentalVehicle,
    fuelCode,
    carRegistration,
    categoryLabel,
    message,
    whatsappNumber,
  ]);

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

      <div className="mt-5 flex justify-end">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-success text-white font-semibold py-3 px-6 hover:bg-success/90"
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </a>
      </div>

      {email ? (
        <p className="mt-4 text-xs text-textdark/50">
          Prefer email? Reach us at the details above.
        </p>
      ) : null}
    </section>
  );
}