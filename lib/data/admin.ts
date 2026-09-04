import { createAdminClient } from "@/lib/supabase/admin";
import type { JSONContent } from "@tiptap/core";
import type { Service, PartnerType, Garage, PageRecord } from "@/lib/data/types";

export type EmailTemplate = {
  id: string;
  slug: string;
  name: string;
  subject: string;
  from_address: string | null;
  reply_to: string | null;
  variables: { key: string; label: string }[];
  body: JSONContent | null;
  updated_at: string;
};

export type AdminApplication = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  user_id: string | null;
  full_name: string | null;
  contact_number: string | null;
  email: string | null;
  id_or_passport_number: string | null;
  physical_address: string | null;
  car_make_model_year: string | null;
  car_registration_number: string | null;
  ehailing_platform: string | null;
  ehailing_platform_other: string | null;
  driver_type: string | null;
  garage_id: string | null;
  garage_name: string | null;
  weekly_credit_band: string | null;
  heard_about_us: string | null;
  reference_name: string | null;
  deposit_required: boolean | null;
};

export type AdminDriver = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  suspended: boolean;
  created_at: string;
};

function mapApplication(row: Record<string, unknown>): AdminApplication {
  const garage = (row.garages as { name?: string } | null) ?? null;
  return {
    id: String(row.id),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    status: String(row.status ?? "incomplete"),
    user_id: row.user_id ? String(row.user_id) : null,
    full_name: row.full_name ? String(row.full_name) : null,
    contact_number: row.contact_number ? String(row.contact_number) : null,
    email: row.email ? String(row.email) : null,
    id_or_passport_number: row.id_or_passport_number
      ? String(row.id_or_passport_number)
      : null,
    physical_address: row.physical_address ? String(row.physical_address) : null,
    car_make_model_year: row.car_make_model_year
      ? String(row.car_make_model_year)
      : null,
    car_registration_number: row.car_registration_number
      ? String(row.car_registration_number)
      : null,
    ehailing_platform: row.ehailing_platform
      ? String(row.ehailing_platform)
      : null,
    ehailing_platform_other: row.ehailing_platform_other
      ? String(row.ehailing_platform_other)
      : null,
    driver_type: row.driver_type ? String(row.driver_type) : null,
    garage_id: row.garage_id ? String(row.garage_id) : null,
    garage_name: garage?.name ?? null,
    weekly_credit_band: row.weekly_credit_band
      ? String(row.weekly_credit_band)
      : null,
    heard_about_us: row.heard_about_us ? String(row.heard_about_us) : null,
    reference_name: row.reference_name ? String(row.reference_name) : null,
    deposit_required: row.deposit_required
      ? Boolean(row.deposit_required)
      : null,
  };
}

export async function getAdminApplications(): Promise<AdminApplication[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, garages(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapApplication);
}

export async function getAdminApplication(
  id: string
): Promise<AdminApplication | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, garages(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapApplication(data as Record<string, unknown>);
}

export async function getAdminDrivers(): Promise<AdminDriver[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, phone, suspended, created_at")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    full_name: row.full_name ? String(row.full_name) : null,
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    suspended: Boolean(row.suspended),
    created_at: String(row.created_at ?? ""),
  }));
}

export async function getAdminServices(): Promise<Service[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    detail_content: (row.detail_content as Service["detail_content"]) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    status: String(row.status ?? "published"),
  }));
}

export async function getAdminPartnerTypes(): Promise<PartnerType[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partner_types")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    icon_name: row.icon_name ? String(row.icon_name) : null,
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminGarages(): Promise<Garage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("garages")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    address: row.address ? String(row.address) : null,
    phone: row.phone ? String(row.phone) : null,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    partner_type_id: row.partner_type_id ? String(row.partner_type_id) : null,
    active: Boolean(row.active),
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminPages(): Promise<PageRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("pages").select("*").order("slug");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    meta_title: row.meta_title ? String(row.meta_title) : null,
    meta_description: row.meta_description
      ? String(row.meta_description)
      : null,
    hero_title: row.hero_title ? String(row.hero_title) : null,
    hero_subtitle: row.hero_subtitle ? String(row.hero_subtitle) : null,
    status: String(row.status ?? "published"),
  }));
}

export async function getAdminEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapEmailTemplate);
}

export async function getAdminEmailTemplate(
  id: string
): Promise<EmailTemplate | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapEmailTemplate(data as Record<string, unknown>);
}

function mapEmailTemplate(row: Record<string, unknown>): EmailTemplate {
  let variables: { key: string; label: string }[] = [];
  if (Array.isArray(row.variables)) {
    variables = row.variables
      .filter(
        (v): v is { key: string; label: string } =>
          v != null &&
          typeof v === "object" &&
          typeof (v as { key?: unknown }).key === "string"
      )
      .map((v) => ({
        key: (v as { key: string }).key,
        label:
          typeof (v as { label?: unknown }).label === "string"
            ? (v as { label: string }).label
            : (v as { key: string }).key,
      }));
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    subject: String(row.subject ?? ""),
    from_address: row.from_address ? String(row.from_address) : null,
    reply_to: row.reply_to ? String(row.reply_to) : null,
    variables,
    body: (row.body as JSONContent) ?? null,
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminStats() {  const supabase = createAdminClient();

  const [applications, drivers, garages, services] = await Promise.all([
    supabase.from("applications").select("status"),
    supabase.from("profiles").select("id").neq("role", "admin"),
    supabase.from("garages").select("id").eq("active", true),
    supabase.from("services").select("id").eq("status", "published"),
  ]);

  const statuses = (applications.data ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      const status = String(row.status ?? "incomplete");
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return {
    applications: (applications.data ?? []).length,
    byStatus: statuses,
    drivers: (drivers.data ?? []).length,
    garages: (garages.data ?? []).length,
    services: (services.data ?? []).length,
  };
}
