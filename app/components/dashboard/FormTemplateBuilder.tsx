"use client";

import { useState } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import type { FormField, FormTemplate } from "@/lib/data/types";
import { RichTextEditor } from "@/app/components/dashboard/RichTextEditor";
import { saveFormTemplate } from "@/app/dashboard/admin/forms/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "radio",
  "checkbox",
] as const;

function blankField(): FormField {
  return { key: "", type: "text", label: "", required: true };
}

export function FormTemplateBuilder({
  serviceOptions,
  form,
  isNew,
}: {
  serviceOptions: { id: string; name: string }[];
  form: FormTemplate | null;
  isNew: boolean;
}) {
  const [name, setName] = useState(form?.name ?? "");
  const [slug, setSlug] = useState(form?.slug ?? "");
  const [serviceId, setServiceId] = useState(form?.service_id ?? "");
  const [status, setStatus] = useState(form?.status ?? "draft");
  const [sortOrder, setSortOrder] = useState(form?.sort_order ?? 0);
  const [confirmationMessage, setConfirmationMessage] = useState(
    form?.confirmation_message ?? ""
  );
  const [intro, setIntro] = useState<JSONContent | null>(
    form?.intro_content ?? null
  );
  const [terms, setTerms] = useState<JSONContent | null>(
    form?.terms_content ?? null
  );
  const [fields, setFields] = useState<FormField[]>(
    form?.field_schema.length ? form.field_schema : [blankField()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(index: number, patch: Partial<FormField>) {
    setFields((current) =>
      current.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  }

  function addField() {
    setFields((current) => [...current, blankField()]);
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, i) => i !== index));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const cleanedFields = fields
      .filter((field) => field.key.trim() && field.label.trim())
      .map((field) => ({
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
        options:
          field.options && field.options.length
            ? field.options.filter((o) => o.trim())
            : undefined,
      }));

    const file = new FormData();
    file.append("id", isNew ? "new" : form?.id ?? "new");
    file.append("name", name);
    file.append("slug", slug);
    file.append("service_id", serviceId);
    file.append("status", status);
    file.append("sort_order", String(sortOrder));
    file.append("confirmation_message", confirmationMessage);
    file.append("intro_content", JSON.stringify(intro));
    file.append("terms_content", JSON.stringify(terms));
    file.append("field_schema", JSON.stringify(cleanedFields));

    try {
      await saveFormTemplate(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl space-y-6">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Details</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label htmlFor="service_id" className={labelClass}>
              Service
            </label>
            <select
              id="service_id"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort_order" className={labelClass}>
              Sort Order
            </label>
            <input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmation_message" className={labelClass}>
            Confirmation Message
          </label>
          <input
            id="confirmation_message"
            type="text"
            value={confirmationMessage}
            onChange={(e) => setConfirmationMessage(e.target.value)}
            className={inputClass}
            placeholder="Shown to the client after they submit."
          />
        </div>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Intro Content</h2>
        <RichTextEditor value={intro} onChange={setIntro} />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Fields</h2>
          <button
            type="button"
            onClick={addField}
            className="rounded-lg border border-navy text-navy font-semibold py-2 px-4 hover:bg-navy/5"
          >
            Add field
          </button>
        </div>

        {fields.map((field, index) => (
          <div
            key={index}
            className="rounded-xl border border-grey/40 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-textdark/50">
                Field {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-error text-sm hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Key</label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(index, { key: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. fullName"
                />
              </div>
              <div>
                <label className={labelClass}>Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) =>
                    updateField(index, { label: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Field label shown to client"
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, {
                      type: e.target.value as FormField["type"],
                    })
                  }
                  className={inputClass}
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(field.type === "select" || field.type === "radio") && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Source
                  </label>
                  <select
                    value={field.optionsSource ?? ""}
                    onChange={(e) =>
                      updateField(index, {
                        optionsSource:
                          e.target.value === "garages" ? "garages" : undefined,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Custom options</option>
                    <option value="garages">Garages</option>
                  </select>
                </div>
                {field.optionsSource !== "garages" && (
                  <div>
                    <label className={labelClass}>
                      Options (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(field.options ?? []).join("\n")}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value.split("\n"),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-textdark">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                  className="h-4 w-4 accent-orange"
                />
                Required
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Terms / Footer</h2>
        <RichTextEditor value={terms} onChange={setTerms} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save form"}
        </button>
        <Link
          href="/dashboard/admin/forms"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}