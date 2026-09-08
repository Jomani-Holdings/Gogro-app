import { z } from "zod";
import type { FormField, Garage } from "@/lib/data/types";

export function buildDynamicSchema(
  fields: FormField[],
  garages: Garage[] = []
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "checkbox") {
      if (field.required) {
        shape[field.key] = z
          .boolean()
          .refine((value) => value === true, { message: "This is required" });
      } else {
        shape[field.key] = z.boolean().optional();
      }
      continue;
    }

    const garageIds =
      field.optionsSource === "garages"
        ? garages.map((g) => g.id)
        : undefined;

    const isEnum =
      (field.type === "select" || field.type === "radio") &&
      ((field.options && field.options.length > 0) ||
        (garageIds && garageIds.length > 0));

    if (field.required) {
      if (field.type === "email") {
        shape[field.key] = z.email(`${field.label} is required`);
      } else if (isEnum) {
        shape[field.key] = z.enum(
          (
            garageIds && garageIds.length > 0
              ? garageIds
              : field.options
          ) as [string, ...string[]],
          { message: `Please select ${field.label}` }
        );
      } else if (field.type === "textarea") {
        shape[field.key] = z
          .string()
          .trim()
          .max(3000, `${field.label} is too long`)
          .min(1, `${field.label} is required`);
      } else {
        shape[field.key] = z
          .string()
          .trim()
          .max(1000, `${field.label} is too long`)
          .min(1, `${field.label} is required`);
      }
    } else {
      if (field.type === "email") {
        shape[field.key] = z
          .email(`Please enter a valid email`)
          .or(z.literal(""))
          .optional();
      } else if (isEnum) {
        shape[field.key] = z
          .enum(
            (
              garageIds && garageIds.length > 0
                ? garageIds
                : field.options
            ) as [string, ...string[]],
            { message: `Please select ${field.label}` }
          )
          .optional();
      } else if (field.type === "textarea") {
        shape[field.key] = z.string().trim().max(3000).optional();
      } else {
        shape[field.key] = z.string().trim().max(1000).optional();
      }
    }
  }

  const baseSchema = z.object(shape);

  const conditionalFields = fields.filter(
    (f) =>
      f.required && f.showWhen && Object.keys(f.showWhen).length > 0
  );
  if (conditionalFields.length === 0) return baseSchema;

  return baseSchema.superRefine((values, ctx) => {
    const record = values as Record<string, unknown>;
    for (const field of conditionalFields) {
      const satisfied = Object.entries(
        field.showWhen as Record<string, string>
      ).every(([key, expected]) => String(record[key] ?? "") === String(expected));
      if (!satisfied) continue;
      const raw = record[field.key];
      if (raw === undefined || raw === null || String(raw).trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.key],
          message: `${field.label} is required`,
        });
      }
    }
  });
}