"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormField } from "@/lib/data/types";
import type { Garage } from "@/lib/data/types";
import { buildDynamicSchema } from "@/lib/validation/dynamicForm";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";
const errorTextClass = "text-sm text-error mt-1.5";

type Option = { value: string; label: string };

export type DynamicFormSubmitResult = {
  ok: boolean;
  message?: string;
};

export function DynamicForm({
  fields,
  garages,
  initialData,
  submitLabel = "Submit",
  submitting = false,
  error,
  onSubmit,
}: {
  fields: FormField[];
  garages: Garage[];
  initialData: Record<string, unknown>;
  submitLabel?: string;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (
    data: Record<string, unknown>
  ) => Promise<DynamicFormSubmitResult>;
}) {
  const schema = useMemo(() => buildDynamicSchema(fields), [fields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => {
      const values: Record<string, unknown> = {};
      for (const field of fields) {
        const known = initialData[field.key];
        if (field.type === "checkbox") {
          values[field.key] = Boolean(known);
        } else {
          values[field.key] =
            known !== undefined && known !== null ? String(known) : "";
        }
      }
      return values;
    }, [fields, initialData]),
  });

  const watched = useWatch({ control: form.control });

  const isVisible = (field: FormField) => {
    if (!field.showWhen) return true;
    return Object.entries(field.showWhen).every(
      ([key, expected]) => String(watched[key] ?? "") === String(expected)
    );
  };

  const visibleFields = fields.filter(isVisible);

  function optionsFor(field: FormField): Option[] {
    if (field.optionsSource === "garages") {
      return garages.map((g) => ({ value: g.id, label: g.name }));
    }
    return (field.options ?? []).map((option) => ({
      value: option,
      label: option,
    }));
  }

  async function handleSubmit(data: Record<string, unknown>) {
    return onSubmit(data);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-5"
      noValidate
    >
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {visibleFields.map((field) => {
        const err = form.formState.errors[field.key];
        const options = optionsFor(field);

        if (field.type === "textarea") {
          return (
            <div key={field.key}>
              <label htmlFor={field.key} className={labelClass}>
                {field.label}
                {field.required && <span className="text-error"> *</span>}
              </label>
              <textarea
                id={field.key}
                rows={4}
                placeholder={field.placeholder}
                className={inputClass}
                {...form.register(field.key)}
              />
              {err?.message ? (
                <p className={errorTextClass}>{String(err.message)}</p>
              ) : null}
            </div>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label
              key={field.key}
              className="flex items-start gap-3 text-sm text-textdark/80"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-orange"
                {...form.register(field.key)}
              />
              <span>{field.label}</span>
              {err?.message ? (
                <p className={errorTextClass}>{String(err.message)}</p>
              ) : null}
            </label>
          );
        }

        if (field.type === "radio") {
          return (
            <div key={field.key}>
              <span className={labelClass}>
                {field.label}
                {field.required && <span className="text-error"> *</span>}
              </span>
              <div className="grid gap-2 mt-2">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 rounded-lg border border-grey/40 bg-white px-4 py-3 cursor-pointer hover:border-orange"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="accent-orange"
                      {...form.register(field.key)}
                    />
                    <span className="text-textdark">{option.label}</span>
                  </label>
                ))}
              </div>
              {err?.message ? (
                <p className={errorTextClass}>{String(err.message)}</p>
              ) : null}
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key}>
              <label htmlFor={field.key} className={labelClass}>
                {field.label}
                {field.required && <span className="text-error"> *</span>}
              </label>
              <select
                id={field.key}
                className={inputClass}
                defaultValue=""
                {...form.register(field.key)}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {err?.message ? (
                <p className={errorTextClass}>{String(err.message)}</p>
              ) : null}
            </div>
          );
        }

        return (
          <div key={field.key}>
            <label htmlFor={field.key} className={labelClass}>
              {field.label}
              {field.required && <span className="text-error"> *</span>}
            </label>
            <input
              id={field.key}
              type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
              placeholder={field.placeholder}
              className={inputClass}
              {...form.register(field.key)}
            />
            {field.helper ? (
              <p className="text-sm text-textdark/60 mt-2">{field.helper}</p>
            ) : null}
            {err?.message ? (
              <p className={errorTextClass}>{String(err.message)}</p>
            ) : null}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
