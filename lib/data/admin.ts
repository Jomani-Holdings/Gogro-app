import { createAdminClient } from "@/lib/supabase/admin";
import type { JSONContent } from "@tiptap/core";
import type {
  Service,
  PartnerType,
  Garage,
  PageRecord,
  Lead,
  FormTemplate,
  FormField,
  FormSubmission,
  Communication,
  GalleryImage,
  SeoMeta,
  Vehicle,
  VehicleStatus,
  Transaction,
  TransactionType,
  DashboardStats,
  DashboardActiveDriver,
  FuelUsageByGarage,
  TopDebtor,
} from "@/lib/data/types";

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
  driver_status: string;
  car_make_model: string | null;
  car_registration: string | null;
  credit_limit: number | null;
  fuel_balance: number | null;
  repair_balance: number | null;
  fuel_code: string | null;
  fuel_garage_id: string | null;
  fuel_garage_name: string | null;
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
    .select("*, garages(name)")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapAdminDriver);
}

export async function getAdminDriver(id: string): Promise<AdminDriver | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, garages(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapAdminDriver(data as Record<string, unknown>);
}

function mapAdminDriver(row: Record<string, unknown>): AdminDriver {
  const garage = (row.garages as { name?: string } | null) ?? null;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    full_name: row.full_name ? String(row.full_name) : null,
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    suspended: Boolean(row.suspended),
    driver_status: String(row.driver_status ?? "pending"),
    car_make_model: row.car_make_model ? String(row.car_make_model) : null,
    car_registration: row.car_registration ? String(row.car_registration) : null,
    credit_limit:
      row.credit_limit === null || row.credit_limit === undefined
        ? null
        : Number(row.credit_limit),
    fuel_balance:
      row.fuel_balance === null || row.fuel_balance === undefined
        ? 0
        : Number(row.fuel_balance),
    repair_balance:
      row.repair_balance === null || row.repair_balance === undefined
        ? null
        : Number(row.repair_balance),
    fuel_code: row.fuel_code ? String(row.fuel_code) : null,
    fuel_garage_id: row.fuel_garage_id ? String(row.fuel_garage_id) : null,
    fuel_garage_name: garage?.name ?? null,
    created_at: String(row.created_at ?? ""),
  };
}

export async function getAdminDriverByUserId(
  userId: string
): Promise<AdminDriver | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, garages(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapAdminDriver(data as Record<string, unknown>);
}

export async function getAdminLeadByUserId(
  userId: string
): Promise<Lead | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, services(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapLead(data as Record<string, unknown>);
}

export async function getAdminGarageOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("garages")
    .select("id, name")
    .order("name");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
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
    image_path: row.image_path ? String(row.image_path) : null,
    alt_text: row.alt_text ? String(row.alt_text) : null,
    description: row.description ? String(row.description) : null,
  }));
}

export async function getAdminVehicleDriverOptions(): Promise<
  { id: string; full_name: string | null }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("role", "admin")
    .order("full_name");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    full_name: row.full_name ? String(row.full_name) : null,
  }));
}

export async function getAdminDriverVehicles(
  driverId: string
): Promise<{ id: string; make_model: string; registration: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, make_model, registration")
    .eq("driver_id", driverId)
    .order("make_model");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    make_model: String(row.make_model ?? ""),
    registration: String(row.registration ?? ""),
  }));
}

function mapVehicle(row: Record<string, unknown>): Vehicle {
  const driver = (row.profiles as { full_name?: string | null } | null) ?? null;
  return {
    id: String(row.id),
    make_model: String(row.make_model ?? ""),
    registration: String(row.registration ?? ""),
    driver_id: row.driver_id ? String(row.driver_id) : null,
    driver_name: driver?.full_name ?? null,
    owner_name: row.owner_name ? String(row.owner_name) : null,
    category: row.category ? String(row.category) : null,
    ownership_type: (row.ownership_type
      ? String(row.ownership_type)
      : "managed") as Vehicle["ownership_type"],
    weekly_rental:
      row.weekly_rental === null || row.weekly_rental === undefined
        ? null
        : Number(row.weekly_rental),
    status: String(row.status ?? "active") as VehicleStatus,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminVehicles(): Promise<Vehicle[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, profiles(id, full_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapVehicle);
}

export async function getAdminVehicle(id: string): Promise<Vehicle | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, profiles(id, full_name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapVehicle(data as Record<string, unknown>);
}

function startOfMonth(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start.toISOString();
}

function startOfWeek(): string {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const weekStart = startOfWeek();

  const [
    activeDriversRes,
    fuelIssuedWeekRes,
    outstandingFuelRes,
    repaymentsRes,
    issuedRes,
    repairBenefitsRes,
    repairOutstandingRes,
    vehiclesRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id")
      .eq("driver_status", "active"),
    supabase
      .from("transactions")
      .select("amount, litres")
      .eq("type", "fuel_issue")
      .gte("created_at", weekStart),
    supabase
      .from("profiles")
      .select("fuel_balance")
      .neq("role", "admin"),
    supabase
      .from("transactions")
      .select("amount")
      .in("type", ["fuel_repayment", "repair_repayment"]),
    supabase
      .from("transactions")
      .select("amount")
      .in("type", ["fuel_issue", "repair_issue"]),
    supabase
      .from("profiles")
      .select("id")
      .gt("repair_balance", 0),
    supabase.from("profiles").select("repair_balance"),
    supabase
      .from("vehicles")
      .select("id, ownership_type")
      .eq("status", "active"),
  ]);

  const activeDrivers = activeDriversRes.data?.length ?? 0;

  const fuelIssuedThisWeek = {
    amount: Number(
      (fuelIssuedWeekRes.data ?? []).reduce(
        (sum, t) => sum + Number(t.amount ?? 0),
        0
      )
    ),
    litres: Number(
      (fuelIssuedWeekRes.data ?? []).reduce(
        (sum, t) => sum + Number(t.litres ?? 0),
        0
      )
    ),
  };

  const outstandingFuelCredit = Number(
    (outstandingFuelRes.data ?? []).reduce(
      (sum, p) => sum + Number(p.fuel_balance ?? 0),
      0
    )
  );

  const totalRepaid = Number(
    (repaymentsRes.data ?? []).reduce(
      (sum, t) => sum + Number(t.amount ?? 0),
      0
    )
  );
  const totalIssued = Number(
    (issuedRes.data ?? []).reduce((sum, t) => sum + Number(t.amount ?? 0), 0)
  );
  const repaymentRate =
    totalIssued > 0 ? Math.round((totalRepaid / totalIssued) * 100) : 0;

  const activeRepairBenefits = repairBenefitsRes.data?.length ?? 0;

  const repairCreditOutstanding = Number(
    (repairOutstandingRes.data ?? []).reduce(
      (sum, p) => sum + Number(p.repair_balance ?? 0),
      0
    )
  );

  const activeVehicles = (vehiclesRes.data ?? []) as {
    ownership_type: string | null;
  }[];
  const rentalVehicles = activeVehicles.filter(
    (v) => v.ownership_type === "rental"
  ).length;
  const vehiclesUnderManagement = activeVehicles.filter(
    (v) => v.ownership_type === "managed" || v.ownership_type === "own"
  ).length;

  return {
    activeDrivers,
    fuelIssuedThisWeek,
    outstandingFuelCredit,
    repaymentRate,
    activeRepairBenefits,
    repairCreditOutstanding,
    vehiclesUnderManagement,
    rentalVehicles,
  };
}

export async function getAdminActiveDriversForDashboard(): Promise<
  DashboardActiveDriver[]
> {
  const supabase = createAdminClient();
  const monthStart = startOfMonth();

  const [profilesRes, fuelRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, driver_status, fuel_balance, repair_balance, vehicles(id, make_model, registration, status)"
      )
      .eq("driver_status", "active")
      .order("full_name"),
    supabase
      .from("transactions")
      .select("driver_id, litres")
      .eq("type", "fuel_issue")
      .gte("created_at", monthStart),
  ]);

  const fuelByDriver = new Map<string, number>();
  for (const t of (fuelRes.data ?? []) as { driver_id: string; litres: number | null }[]) {
    fuelByDriver.set(
      t.driver_id,
      (fuelByDriver.get(t.driver_id) ?? 0) + Number(t.litres ?? 0)
    );
  }

  return ((profilesRes.data ?? []) as Record<string, unknown>[]).map((row) => {
    const vehicles = (row.vehicles as
      | { id: string; make_model: string; registration: string; status: string }[]
      | null) ?? [];
    const primaryVehicle =
      vehicles.find((v) => v.status === "active") ?? vehicles[0] ?? null;

    return {
      id: String(row.id),
      full_name: row.full_name ? String(row.full_name) : null,
      email: row.email ? String(row.email) : null,
      fuel_balance:
        row.fuel_balance === null || row.fuel_balance === undefined
          ? 0
          : Number(row.fuel_balance),
      repair_balance:
        row.repair_balance === null || row.repair_balance === undefined
          ? null
          : Number(row.repair_balance),
      vehicle: primaryVehicle
        ? {
            id: String(primaryVehicle.id),
            make_model: String(primaryVehicle.make_model),
            registration: String(primaryVehicle.registration),
          }
        : null,
      fuel_used_this_month: Number(fuelByDriver.get(String(row.id)) ?? 0),
    };
  });
}

export async function getFuelUsageByGarage(): Promise<FuelUsageByGarage[]> {
  const supabase = createAdminClient();
  const monthStart = startOfMonth();

  const { data, error } = await supabase
    .from("transactions")
    .select("garage_id, amount, litres, garages(name)")
    .eq("type", "fuel_issue")
    .gte("created_at", monthStart);

  if (error) throw new Error(error.message);

  const byGarage = new Map<
    string,
    { garage_id: string | null; garage_name: string | null; litres: number; amount: number }
  >();

  for (const t of (data ?? []) as Record<string, unknown>[]) {
    const garageId = t.garage_id ? String(t.garage_id) : null;
    const garage = (t.garages as { name?: string } | null) ?? null;
    const key = garageId ?? "unassigned";
    const entry = byGarage.get(key) ?? {
      garage_id: garageId,
      garage_name: garage?.name ?? "Unassigned",
      litres: 0,
      amount: 0,
    };
    entry.litres += Number(t.litres ?? 0);
    entry.amount += Number(t.amount ?? 0);
    byGarage.set(key, entry);
  }

  return [...byGarage.values()].sort((a, b) => b.litres - a.litres);
}

export async function getTopDebtors(limit = 5): Promise<TopDebtor[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, fuel_balance, repair_balance")
    .neq("role", "admin");

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[])
    .map((row) => {
      const fuel = row.fuel_balance ? Number(row.fuel_balance) : 0;
      const repair = row.repair_balance ? Number(row.repair_balance) : 0;
      return {
        id: String(row.id),
        full_name: row.full_name ? String(row.full_name) : null,
        fuel_balance: fuel,
        repair_balance: repair,
        total_balance: fuel + repair,
      };
    })
    .filter((d) => d.total_balance > 0)
    .sort((a, b) => b.total_balance - a.total_balance)
    .slice(0, limit);
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  const vehicle = (row.vehicles as { make_model?: string } | null) ?? null;
  const garage = (row.garages as { name?: string } | null) ?? null;
  return {
    id: String(row.id),
    driver_id: String(row.driver_id),
    vehicle_id: row.vehicle_id ? String(row.vehicle_id) : null,
    garage_id: row.garage_id ? String(row.garage_id) : null,
    vehicle_name: vehicle?.make_model ?? null,
    garage_name: garage?.name ?? null,
    type: String(row.type) as TransactionType,
    amount: Number(row.amount ?? 0),
    litres: row.litres === null || row.litres === undefined ? null : Number(row.litres),
    created_at: String(row.created_at ?? ""),
  };
}

export async function getDriverTransactions(
  driverId: string,
  limit = 20
): Promise<Transaction[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, vehicles(make_model), garages(name)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[]).map(mapTransaction);
}

export type AdminTransaction = Transaction & {
  driver_name: string | null;
};

export async function getAdminTransactions(
  limit = 200
): Promise<AdminTransaction[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "*, vehicles(make_model), garages(name), profiles(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const base = mapTransaction(row);
    const driver = (row.profiles as { full_name?: string | null } | null) ?? null;
    return { ...base, driver_name: driver?.full_name ?? null };
  });
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

export async function getAdminStats() {
  const supabase = createAdminClient();

  const [leads, submissions, clients, garages, services] = await Promise.all([
    supabase.from("leads").select("status"),
    supabase.from("form_submissions").select("status"),
    supabase.from("profiles").select("id").neq("role", "admin"),
    supabase.from("garages").select("id").eq("active", true),
    supabase.from("services").select("id").eq("status", "published"),
  ]);
  const leadStatuses = (leads.data ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      const status = String(row.status ?? "new");
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const submissionStatuses = (submissions.data ?? []).reduce<
    Record<string, number>
  >((acc, row) => {
    const status = String(row.status ?? "pending");
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    leads: (leads.data ?? []).length,
    byStatus: leadStatuses,
    submissions: (submissions.data ?? []).length,
    bySubmissionStatus: submissionStatuses,
    drivers: (clients.data ?? []).length,
    garages: (garages.data ?? []).length,
    services: (services.data ?? []).length,
  };
}

export async function getAdminLeads(): Promise<Lead[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, services(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) =>
    mapLead(row)
  );
}

export async function getAdminLead(id: string): Promise<Lead | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, services(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapLead(data as Record<string, unknown>);
}

function mapLead(row: Record<string, unknown>): Lead {
  const service = (row.services as { name?: string } | null) ?? null;
  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    service_id: row.service_id ? String(row.service_id) : null,
    full_name: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: String(row.status ?? "new"),
    source: row.source ? String(row.source) : null,
    notes: row.notes ? String(row.notes) : null,
    assigned_to: row.assigned_to ? String(row.assigned_to) : null,
    service_name: service?.name ?? null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminFormTemplates(): Promise<FormTemplate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_templates")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) =>
    mapFormTemplate(row)
  );
}

export async function getAdminFormTemplate(
  id: string
): Promise<FormTemplate | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapFormTemplate(data as Record<string, unknown>);
}

export async function getPublishedFormTemplates(): Promise<FormTemplate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_templates")
    .select("*")
    .eq("status", "published")
    .order("sort_order");

  if (error || !data || data.length === 0) return [];
  return ((data as Record<string, unknown>[]) ?? []).map((row) =>
    mapFormTemplate(row)
  );
}

function mapFormTemplate(row: Record<string, unknown>): FormTemplate {
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
    intro_content: (row.intro_content as JSONContent) ?? null,
    field_schema: fieldSchema,
    terms_content: (row.terms_content as JSONContent) ?? null,
    confirmation_message: row.confirmation_message
      ? String(row.confirmation_message)
      : null,
    email_template_slug: row.email_template_slug
      ? String(row.email_template_slug)
      : null,
    contract_document_path: row.contract_document_path
      ? String(row.contract_document_path)
      : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminSubmissions(): Promise<FormSubmission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, leads(full_name, email), form_templates(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) =>
    mapSubmission(row)
  );
}

export async function getSubmissionsForLead(
  leadId: string
): Promise<FormSubmission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, form_templates(name)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) =>
    mapSubmission(row)
  );
}

export async function getAdminSubmission(
  id: string
): Promise<FormSubmission | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*, leads(full_name, email), form_templates(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapSubmission(data as Record<string, unknown>);
}

function mapSubmission(row: Record<string, unknown>): FormSubmission {
  const lead = (row.leads as { full_name?: string; email?: string } | null) ??
    null;
  const template = (row.form_templates as { name?: string } | null) ?? null;
  return {
    id: String(row.id),
    lead_id: String(row.lead_id),
    form_template_id: String(row.form_template_id),
    status: String(row.status ?? "pending"),
    data:
      row.data && typeof row.data === "object"
        ? (row.data as Record<string, unknown>)
        : {},
    access_token: row.access_token ? String(row.access_token) : null,
    access_token_expires_at: row.access_token_expires_at
      ? String(row.access_token_expires_at)
      : null,
    submitted_at: row.submitted_at ? String(row.submitted_at) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    full_name: lead?.full_name ?? null,
    email: lead?.email ?? null,
    template_name: template?.name ?? null,
  };
}

export async function getAdminCommunications(
  leadId: string
): Promise<Communication[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("communications")
    .select("*")
    .eq("lead_id", leadId)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    lead_id: String(row.lead_id),
    type: (row.type as Communication["type"]) ?? "note",
    direction: (row.direction as Communication["direction"]) ?? "outbound",
    subject: row.subject ? String(row.subject) : null,
    body: row.body ? String(row.body) : null,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    sent_at: String(row.sent_at ?? ""),
  }));
}

export async function getAdminGalleryImages(): Promise<GalleryImage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapGalleryImage);
}

export async function getAdminGalleryImage(
  id: string
): Promise<GalleryImage | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapGalleryImage(data as Record<string, unknown>);
}

function mapGalleryImage(row: Record<string, unknown>): GalleryImage {
  return {
    id: String(row.id),
    storage_path: String(row.storage_path),
    filename: String(row.filename),
    caption: row.caption ? String(row.caption) : null,
    alt_text: row.alt_text ? String(row.alt_text) : null,
    description: row.description ? String(row.description) : null,
    sort_order: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getAdminSeoMeta(): Promise<SeoMeta[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seo_meta")
    .select("*")
    .order("route_path");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapSeoMeta);
}

export async function getAdminSeoMetaByRoute(
  routePath: string
): Promise<SeoMeta | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seo_meta")
    .select("*")
    .eq("route_path", routePath)
    .maybeSingle();

  if (error || !data) return null;
  return mapSeoMeta(data as Record<string, unknown>);
}

function mapSeoMeta(row: Record<string, unknown>): SeoMeta {
  return {
    id: String(row.id),
    route_path: String(row.route_path),
    page_title: row.page_title ? String(row.page_title) : null,
    meta_title: row.meta_title ? String(row.meta_title) : null,
    meta_description: row.meta_description ? String(row.meta_description) : null,
    og_title: row.og_title ? String(row.og_title) : null,
    og_description: row.og_description ? String(row.og_description) : null,
    og_image_url: row.og_image_url ? String(row.og_image_url) : null,
    canonical_path: row.canonical_path ? String(row.canonical_path) : null,
    noindex: Boolean(row.noindex),
    updated_at: String(row.updated_at ?? ""),
  };
}
