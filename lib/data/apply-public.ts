import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FormTemplate,
  FormField,
  Garage,
} from "@/lib/data/types";
import { getGaragesByTypeSlug } from "@/lib/data/garages";

export type PublicFormPayload = {
  submissionId: string;
  leadId: string;
  status: string;
  data: Record<string, unknown>;
  template: FormTemplate;
  lead: {
    user_id: string | null;
    full_name: string;
    email: string;
    phone: string;
  };
  garages: Garage[];
};

export async function getPublicForm(
  submissionId: string,
  token: string
): Promise<PublicFormPayload | null> {
  const admin = createAdminClient();

  const { data: submission, error } = await admin
    .from("form_submissions")
    .select("id, status, data, access_token, access_token_expires_at, lead_id, form_template_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !submission) return null;
  if (submission.access_token !== token) return null;

  const expiresAt = submission.access_token_expires_at
    ? new Date(submission.access_token_expires_at).getTime()
    : null;
  if (expiresAt && Date.now() > expiresAt) return null;

  const [templateRes, leadRes, garages] = await Promise.all([
    admin
      .from("form_templates")
      .select("*")
      .eq("id", submission.form_template_id)
      .maybeSingle(),
    admin
      .from("leads")
      .select("user_id, full_name, email, phone")
      .eq("id", submission.lead_id)
      .maybeSingle(),
    getGaragesByTypeSlug(),
  ]);

  if (templateRes.error || !templateRes.data || leadRes.error || !leadRes.data) {
    return null;
  }

  return {
    submissionId: String(submission.id),
    leadId: String(submission.lead_id),
    status: String(submission.status),
    data:
      submission.data && typeof submission.data === "object"
        ? (submission.data as Record<string, unknown>)
        : {},
    template: mapTemplate(templateRes.data as Record<string, unknown>),
    lead: {
      user_id: leadRes.data.user_id ? String(leadRes.data.user_id) : null,
      full_name: String(leadRes.data.full_name ?? ""),
      email: String(leadRes.data.email ?? ""),
      phone: String(leadRes.data.phone ?? ""),
    },
    garages: garages ?? [],
  };
}

function mapTemplate(row: Record<string, unknown>): FormTemplate {
  let fieldSchema: FormField[] = [];
  if (Array.isArray(row.field_schema)) {
    fieldSchema = (row.field_schema as Record<string, unknown>[]).map(
      (f) => ({
        key: String(f.key ?? ""),
        type: (f.type as FormField["type"]) ?? "text",
        label: String(f.label ?? ""),
        required: Boolean(f.required),
        options: Array.isArray(f.options)
          ? (f.options as unknown[]).map(String)
          : undefined,
        optionsSource:
          f.optionsSource === "garages" ? "garages" : undefined,
        placeholder: f.placeholder ? String(f.placeholder) : undefined,
        helper: f.helper ? String(f.helper) : undefined,
        showWhen: (f.showWhen as Record<string, string>) ?? undefined,
      })
    );
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    service_id: row.service_id ? String(row.service_id) : null,
    name: String(row.name),
    status: String(row.status ?? "draft"),
    intro_content: (row.intro_content as never) ?? null,
    field_schema: fieldSchema,
    terms_content: (row.terms_content as never) ?? null,
    confirmation_message: row.confirmation_message
      ? String(row.confirmation_message)
      : null,
    email_template_slug: row.email_template_slug
      ? String(row.email_template_slug)
      : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}
