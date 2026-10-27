import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/media";
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
  id_number: string | null;
  suburb: string | null;
  license_valid: string | null;
  years_experience: string | null;
  preferred_vehicle_category: string | null;
  marketing_source: string | null;
  primary_service: string | null;
  driver_balance: number;
  fuel_balance: number;
  repair_balance: number;
  rental_balance: number;
  penalty_balance: number;
  weekly_fuel_limit: number;
  weekly_fuel_issued: number;
  weekly_fuel_available: number;
  next_payment_due: string | null;
  is_overdue: boolean;
  payment_due_day: string;
  payment_due_time: string;
  payment_arrangement_due_date: string | null;
  payment_arrangement_notes: string | null;
  overlimit_count: number;
  fuel_code: string | null;
  fuel_garage_id: string | null;
  fuel_garage_name: string | null;
  points_balance: number;
  lifetime_points_earned: number;
  lifetime_points_redeemed: number;
  current_streak: number;
  referral_code: string | null;
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

export type CursorDirection = "next" | "prev";

export type CursorPage<T> = {
  rows: T[];
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
};

export type CursorRequest = {
  cursor?: string;
  direction?: CursorDirection;
  pageSize?: number;
};

type DecodedCursor = {
  createdAt: string;
  id: string;
};

function encodeCursorValue(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor?: string): DecodedCursor | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf("|");
    if (separator <= 0) return null;
    const createdAt = decoded.slice(0, separator);
    const id = decoded.slice(separator + 1);
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

function sanitizeSearchTerm(query?: string): string {
  return (query ?? "").trim().replace(/[\\%,()*]/g, "").slice(0, 100);
}

function cursorFilter(
  cursor: DecodedCursor,
  direction: CursorDirection
): string {
  const operator = direction === "prev" ? "gt" : "lt";
  return `created_at.${operator}."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.${operator}."${cursor.id}")`;
}

function cursorFilterAt(
  cursor: DecodedCursor,
  direction: CursorDirection,
  column: string
): string {
  const operator = direction === "prev" ? "gt" : "lt";
  return `${column}.${operator}."${cursor.createdAt}",and(${column}.eq."${cursor.createdAt}",id.${operator}."${cursor.id}")`;
}

function encodePageRow(
  row: unknown,
  timestampKey: string
): string | null {
  const record = row as Record<string, unknown>;
  const createdAt = record[timestampKey];
  const id = record.id;
  if (!createdAt || !id) return null;
  return encodeCursorValue(String(createdAt), String(id));
}

function buildCursorPage<T>(
  fetched: T[],
  direction: CursorDirection,
  pageSize: number,
  hadCursor: boolean,
  timestampKey = "created_at"
): CursorPage<T> {
  if (direction === "prev") {
    const hasPreviousPage = fetched.length > pageSize;
    const rows = fetched.slice(0, pageSize).reverse();
    return {
      rows,
      pageSize,
      hasNextPage: hadCursor,
      hasPreviousPage,
      nextCursor: rows.length
        ? encodePageRow(rows[rows.length - 1], timestampKey)
        : null,
      prevCursor: rows.length ? encodePageRow(rows[0], timestampKey) : null,
    };
  }

  const hasNextPage = fetched.length > pageSize;
  const rows = fetched.slice(0, pageSize);
  return {
    rows,
    pageSize,
    hasNextPage,
    hasPreviousPage: hadCursor,
    nextCursor:
      hasNextPage && rows.length
        ? encodePageRow(rows[rows.length - 1], timestampKey)
        : null,
    prevCursor: rows.length ? encodePageRow(rows[0], timestampKey) : null,
  };
}

function normalizePageSize(pageSize?: number, fallback = 25): number {
  return Math.min(100, Math.max(1, pageSize ?? fallback));
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

export type AdminDriverFilters = CursorRequest & {
  query?: string;
  status?: string;
  garage?: string;
  suspended?: boolean;
};

export async function getAdminDrivers(
  filters: AdminDriverFilters = {}
): Promise<CursorPage<AdminDriver>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase
    .from("driver_account_summary")
    .select("*")
    .neq("role", "admin");

  if (filters.status && filters.status !== "all") {
    q = q.eq("driver_status", filters.status);
  }
  if (filters.garage && filters.garage !== "all") {
    q = q.eq("fuel_garage_id", filters.garage);
  }
  if (filters.suspended !== undefined) {
    q = q.eq("suspended", filters.suspended);
  }

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,fuel_code.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);
  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  return { ...page, rows: page.rows.map(mapAdminDriver) };
}

export async function getAdminDriver(id: string): Promise<AdminDriver | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("driver_account_summary")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapAdminDriver(data as Record<string, unknown>);
}

function mapAdminDriver(row: Record<string, unknown>): AdminDriver {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    full_name: row.full_name ? String(row.full_name) : null,
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    suspended: Boolean(row.suspended),
    driver_status: String(row.driver_status ?? "pending"),
    car_make_model: row.car_make_model ? String(row.car_make_model) : null,
    car_registration: row.car_registration
      ? String(row.car_registration)
      : null,
    id_number: row.id_number ? String(row.id_number) : null,
    suburb: row.suburb ? String(row.suburb) : null,
    license_valid: row.license_valid ? String(row.license_valid) : null,
    years_experience: row.years_experience
      ? String(row.years_experience)
      : null,
    preferred_vehicle_category: row.preferred_vehicle_category
      ? String(row.preferred_vehicle_category)
      : null,
    marketing_source: row.marketing_source
      ? String(row.marketing_source)
      : null,
    primary_service: row.primary_service ? String(row.primary_service) : null,
    driver_balance:
      row.driver_balance === null || row.driver_balance === undefined
        ? 0
        : Number(row.driver_balance),
    fuel_balance:
      row.fuel_balance === null || row.fuel_balance === undefined
        ? 0
        : Number(row.fuel_balance),
    repair_balance:
      row.repair_balance === null || row.repair_balance === undefined
        ? 0
        : Number(row.repair_balance),
    rental_balance:
      row.rental_balance === null || row.rental_balance === undefined
        ? 0
        : Number(row.rental_balance),
    penalty_balance:
      row.penalty_balance === null || row.penalty_balance === undefined
        ? 0
        : Number(row.penalty_balance),
    weekly_fuel_limit:
      row.weekly_fuel_limit === null || row.weekly_fuel_limit === undefined
        ? 2000
        : Number(row.weekly_fuel_limit),
    weekly_fuel_issued:
      row.weekly_fuel_issued === null || row.weekly_fuel_issued === undefined
        ? 0
        : Number(row.weekly_fuel_issued),
    weekly_fuel_available:
      row.weekly_fuel_available === null ||
      row.weekly_fuel_available === undefined
        ? 0
        : Number(row.weekly_fuel_available),
    next_payment_due: row.next_payment_due
      ? String(row.next_payment_due)
      : null,
    is_overdue: Boolean(row.is_overdue),
    payment_due_day: String(row.payment_due_day ?? "tuesday"),
    payment_due_time: String(row.payment_due_time ?? "13:00"),
    payment_arrangement_due_date: row.payment_arrangement_due_date
      ? String(row.payment_arrangement_due_date)
      : null,
    payment_arrangement_notes: row.payment_arrangement_notes
      ? String(row.payment_arrangement_notes)
      : null,
    overlimit_count: Number(row.overlimit_count ?? 0),
    fuel_code: row.fuel_code ? String(row.fuel_code) : null,
    fuel_garage_id: row.fuel_garage_id ? String(row.fuel_garage_id) : null,
    fuel_garage_name: row.fuel_garage_name
      ? String(row.fuel_garage_name)
      : null,
    points_balance: Number(row.points_balance ?? 0),
    lifetime_points_earned: Number(row.lifetime_points_earned ?? 0),
    lifetime_points_redeemed: Number(row.lifetime_points_redeemed ?? 0),
    current_streak: Number(row.current_streak ?? 0),
    referral_code: row.referral_code ? String(row.referral_code) : null,
    created_at: String(row.created_at ?? ""),
  };
}

export async function getAdminDriverByUserId(
  userId: string
): Promise<AdminDriver | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("driver_account_summary")
    .select("*")
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

export type AdminGarageOption = {
  id: string;
  name: string;
  partner_type_id: string | null;
  partner_type_slug: string | null;
};

export async function getAdminGarageOptions(): Promise<AdminGarageOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("garages")
    .select("id, name, partner_type_id, partner_types(slug)")
    .order("name");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => {
    const partner = (row.partner_types as { slug?: string } | null) ?? null;
    return {
      id: String(row.id),
      name: String(row.name),
      partner_type_id: row.partner_type_id ? String(row.partner_type_id) : null,
      partner_type_slug: partner?.slug ?? null,
    };
  });
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
    category: (row.category ? String(row.category) : null) as Vehicle["category"],
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

export type AdminVehicleFilters = CursorRequest & {
  query?: string;
  status?: string;
  fleetOnly?: boolean;
};

export async function getAdminVehicles(
  filters: AdminVehicleFilters = {}
): Promise<CursorPage<Vehicle>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase.from("vehicles").select("*, profiles(id, full_name)");

  if (filters.fleetOnly) {
    q = q.neq("ownership_type", "own");
  }
  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `make_model.ilike.%${term}%,registration.ilike.%${term}%,owner_name.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);
  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  return { ...page, rows: page.rows.map(mapVehicle) };
}

export async function getAdminVehicleOptions(): Promise<
  { id: string; make_model: string; registration: string }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, make_model, registration")
    .order("make_model");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    make_model: String(row.make_model ?? ""),
    registration: String(row.registration ?? ""),
  }));
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

function rpcRecord(data: unknown): Record<string, unknown> {
  if (Array.isArray(data)) {
    return (data[0] as Record<string, unknown> | undefined) ?? {};
  }
  return (data as Record<string, unknown> | null) ?? {};
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw new Error(error.message);

  const row = rpcRecord(data);
  const fuelIssued = (row.fuelIssuedThisCycle as
    | { amount?: unknown; litres?: unknown }
    | null) ?? {};

  return {
    activeDrivers: Number(row.activeDrivers ?? 0),
    fuelIssuedThisCycle: {
      amount: Number(fuelIssued.amount ?? 0),
      litres: Number(fuelIssued.litres ?? 0),
    },
    totalOutstanding: Number(row.totalOutstanding ?? 0),
    repaymentRate: Number(row.repaymentRate ?? 0),
    overdueAccounts: Number(row.overdueAccounts ?? 0),
    accountsOverLimit: Number(row.accountsOverLimit ?? 0),
    vehiclesUnderManagement: Number(row.vehiclesUnderManagement ?? 0),
    rentalVehicles: Number(row.rentalVehicles ?? 0),
  };
}

export async function getAdminActiveDriversForDashboard(
  limit = 20
): Promise<DashboardActiveDriver[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "admin_active_drivers_for_dashboard",
    { p_limit: limit }
  );
  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const vehicle = (row.vehicle as
      | {
          id?: unknown;
          make_model?: unknown;
          registration?: unknown;
        }
      | null) ?? null;

    return {
      id: String(row.id),
      full_name: row.full_name ? String(row.full_name) : null,
      email: row.email ? String(row.email) : null,
      driver_balance: Number(row.driver_balance ?? 0),
      vehicle:
        vehicle && vehicle.id
          ? {
              id: String(vehicle.id),
              make_model: String(vehicle.make_model ?? ""),
              registration: String(vehicle.registration ?? ""),
            }
          : null,
      fuel_used_this_month: Number(row.fuel_used_this_month ?? 0),
      weekly_fuel_limit: Number(row.weekly_fuel_limit ?? 2000),
      weekly_fuel_issued: Number(row.weekly_fuel_issued ?? 0),
      next_payment_due: row.next_payment_due
        ? String(row.next_payment_due)
        : null,
      is_overdue: Boolean(row.is_overdue),
    };
  });
}

export async function getFuelUsageByGarage(): Promise<FuelUsageByGarage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("admin_fuel_usage_by_garage");
  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    garage_id: row.garage_id ? String(row.garage_id) : null,
    garage_name: row.garage_name ? String(row.garage_name) : null,
    litres: Number(row.litres ?? 0),
    amount: Number(row.amount ?? 0),
  }));
}

export async function getTopDebtors(limit = 5): Promise<TopDebtor[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("admin_top_debtors", {
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    full_name: row.full_name ? String(row.full_name) : null,
    driver_balance: Number(row.driver_balance ?? 0),
    total_balance: Number(row.total_balance ?? 0),
  }));
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
    points_earned: Number(row.points_earned ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

function mapActiveTransaction(row: Record<string, unknown>): AdminTransaction {
  return {
    id: String(row.id),
    driver_id: String(row.driver_id),
    vehicle_id: row.vehicle_id ? String(row.vehicle_id) : null,
    garage_id: row.garage_id ? String(row.garage_id) : null,
    vehicle_name: row.vehicle_name ? String(row.vehicle_name) : null,
    garage_name: row.garage_name ? String(row.garage_name) : null,
    type: String(row.type) as TransactionType,
    amount: Number(row.amount ?? 0),
    litres: row.litres === null || row.litres === undefined ? null : Number(row.litres),
    points_earned: Number(row.points_earned ?? 0),
    created_at: String(row.created_at ?? ""),
    driver_name: row.driver_name ? String(row.driver_name) : null,
  };
}

export async function getDriverTransactions(
  driverId: string,
  limit = 20
): Promise<Transaction[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("active_transactions")
    .select(
      "id, driver_id, vehicle_id, garage_id, vehicle_name, garage_name, type, amount, litres, points_earned, created_at"
    )
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[]).map(mapActiveTransaction);
}

export type AdminRepairDriver = AdminDriver & {
  total_repair_debt: number;
  total_repair_repaid: number;
  net_repair_position: number;
  last_repair_at: string | null;
};

export type AdminRepairFilters = CursorRequest & {
  query?: string;
  status?: string;
};

export async function getAdminRepairDrivers(
  filters: AdminRepairFilters = {}
): Promise<CursorPage<AdminRepairDriver>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase
    .from("driver_account_summary")
    .select("*")
    .neq("role", "admin")
    .gt("repair_balance", 0);

  if (filters.status && filters.status !== "all") {
    q = q.eq("driver_status", filters.status);
  }

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,fuel_code.ilike.%${term}%,car_make_model.ilike.%${term}%,car_registration.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);

  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  const drivers = page.rows.map(mapAdminDriver);
  const ids = drivers.map((driver) => driver.id);

  const stats = new Map<
    string,
    { repaid: number; last: string | null }
  >();
  if (ids.length > 0) {
    const { data: statRows, error: statError } = await supabase.rpc(
      "admin_repair_stats",
      { p_driver_ids: ids }
    );
    if (statError) throw new Error(statError.message);

    for (const row of (statRows ?? []) as Record<string, unknown>[]) {
      stats.set(String(row.driver_id), {
        repaid: Number(row.total_repair_repaid ?? 0),
        last: row.last_repair_at ? String(row.last_repair_at) : null,
      });
    }
  }

  return {
    ...page,
    rows: drivers.map((driver) => {
      const stat = stats.get(driver.id) ?? { repaid: 0, last: null };
      return {
        ...driver,
        total_repair_debt: driver.repair_balance + stat.repaid,
        total_repair_repaid: stat.repaid,
        net_repair_position: driver.repair_balance,
        last_repair_at: stat.last,
      };
    }),
  };
}

export type AdminDriverReferral = {
  id: string;
  referred_id: string | null;
  referred_name: string | null;
  referred_email: string | null;
  status: string;
  weeks_paid: number;
  points_earned: number;
  last_payment_at: string | null;
  created_at: string;
};

export async function getAdminDriverReferrals(
  driverId: string
): Promise<AdminDriverReferral[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("driver_referrals")
    .select("*, profiles!referred_id(full_name, email)")
    .eq("referrer_id", driverId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const referred =
      (row.profiles as { full_name?: string | null; email?: string | null } | null) ??
      null;
    return {
      id: String(row.id),
      referred_id: row.referred_id ? String(row.referred_id) : null,
      referred_name: referred?.full_name ?? null,
      referred_email: row.referred_email
        ? String(row.referred_email)
        : referred?.email ?? null,
      status: String(row.status ?? "pending"),
      weeks_paid: Number(row.weeks_paid ?? 0),
      points_earned: Number(row.points_earned ?? 0),
      last_payment_at: row.last_payment_at
        ? String(row.last_payment_at)
        : null,
      created_at: String(row.created_at ?? ""),
    };
  });
}

export type AdminDriverSearchOption = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  car_registration: string | null;
  fuel_code: string | null;
};

export async function getAdminDriverSearchOptions(): Promise<
  AdminDriverSearchOption[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, email, car_registration, fuel_code"
    )
    .neq("role", "admin")
    .order("full_name");

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: String(row.id),
    full_name: row.full_name ? String(row.full_name) : null,
    phone: row.phone ? String(row.phone) : null,
    email: row.email ? String(row.email) : null,
    car_registration: row.car_registration
      ? String(row.car_registration)
      : null,
    fuel_code: row.fuel_code ? String(row.fuel_code) : null,
  }));
}

export type AdminTransaction = Transaction & {
  driver_name: string | null;
};

export type AdminTransactionFilters = CursorRequest & {
  query?: string;
  type?: string;
  from?: string;
  to?: string;
};

export async function getAdminTransactions(
  filters: AdminTransactionFilters = {}
): Promise<CursorPage<AdminTransaction>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase
    .from("admin_transactions_search")
    .select(
      "id, driver_id, vehicle_id, garage_id, vehicle_name, garage_name, type, amount, litres, points_earned, created_at, driver_name"
    );

  if (filters.type && filters.type !== "all") {
    q = q.eq("type", filters.type);
  }
  if (filters.from) q = q.gte("created_at", filters.from);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `driver_name.ilike.%${term}%,driver_email.ilike.%${term}%,driver_phone.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);

  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  return { ...page, rows: page.rows.map(mapActiveTransaction) };
}

export type AdminDeletedTransaction = {
  id: string;
  transaction: AdminTransaction;
  deleted_at: string;
  deleted_by_name: string | null;
};

export type AdminDeletedTransactionFilters = CursorRequest & {
  query?: string;
};

export async function getAdminDeletedTransactions(
  filters: AdminDeletedTransactionFilters = {}
): Promise<CursorPage<AdminDeletedTransaction>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase
    .from("transaction_deletions")
    .select(
      `id,
       transaction_id,
       deleted_at,
       deleted_by_profile:profiles!deleted_by(full_name),
       transactions!transaction_id!inner(
         id, driver_id, vehicle_id, garage_id, type, amount, litres, points_earned, created_at,
         vehicles(make_model), garages(name), profiles!inner(full_name)
       )`
    )
    .is("restored_at", null);

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.filter(
      "transactions.profiles.full_name",
      "ilike",
      `%${term}%`
    );
  }

  if (cursor) {
    q = q.or(cursorFilterAt(cursor, direction, "deleted_at"));
  }

  const { data, error } = await q
    .order("deleted_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);

  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor),
    "deleted_at"
  );

  return {
    ...page,
    rows: page.rows
      .map((row) => {
        const tx = (row.transactions as Record<string, unknown> | null) ?? null;
        if (!tx) return null;
        const base = mapTransaction(tx);
        const driver =
          (tx.profiles as { full_name?: string | null } | null) ?? null;
        const deletedBy =
          (row.deleted_by_profile as { full_name?: string | null } | null) ??
          null;
        return {
          id: String(row.id),
          transaction: { ...base, driver_name: driver?.full_name ?? null },
          deleted_at: String(row.deleted_at),
          deleted_by_name: deletedBy?.full_name ?? null,
        } satisfies AdminDeletedTransaction;
      })
      .filter((row): row is AdminDeletedTransaction => row !== null),
  };
}

export type PaymentProofStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disputed";

export type AdminPaymentProof = {
  id: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  status: PaymentProofStatus;
  category: string;
  filename: string;
  driver_id: string | null;
  driver_name: string | null;
  fuel_code: string | null;
  fuel_balance: number;
  proof_url: string | null;
};

export type PaymentProofFilters = CursorRequest & {
  status?: string;
  category?: string;
  query?: string;
  from?: string;
  to?: string;
};

export async function getAdminPaymentProofs(
  filters: PaymentProofFilters
): Promise<CursorPage<AdminPaymentProof>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  const term = sanitizeSearchTerm(filters.query);
  const profileRelation = term
    ? "profiles!profile_id!inner(full_name, fuel_code, fuel_balance)"
    : "profiles!profile_id(full_name, fuel_code, fuel_balance)";

  let q = supabase
    .from("payment_proofs")
    .select(
      `id, created_at, reviewed_at, reviewer_notes, status, category, filename, storage_path, profile_id, ${profileRelation}`
    );

  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }
  if (filters.category && filters.category !== "all") {
    q = q.eq("category", filters.category);
  }
  if (filters.from) q = q.gte("created_at", filters.from);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59.999Z`);
  if (term) {
    q = q.filter("profiles.full_name", "ilike", `%${term}%`);
  }
  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);

  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );

  const rows = await Promise.all(
    page.rows.map(async (row) => {
      const profile =
        (row.profiles as {
          full_name?: string | null;
          fuel_code?: string | null;
          fuel_balance?: number | null;
        } | null) ?? null;

      let proofUrl: string | null = null;
      if (row.storage_path) {
        const { data: signed } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl(String(row.storage_path), 60 * 60);
        proofUrl = signed?.signedUrl ?? null;
      }

      return {
        id: String(row.id),
        created_at: String(row.created_at),
        reviewed_at: row.reviewed_at ? String(row.reviewed_at) : null,
        reviewer_notes: row.reviewer_notes ? String(row.reviewer_notes) : null,
        status: String(row.status ?? "pending") as PaymentProofStatus,
        category: String(row.category ?? "fuel_repayment"),
        filename: String(row.filename ?? "proof"),
        driver_id: row.profile_id ? String(row.profile_id) : null,
        driver_name: profile?.full_name ?? null,
        fuel_code: profile?.fuel_code ?? null,
        fuel_balance: Number(profile?.fuel_balance ?? 0),
        proof_url: proofUrl,
      };
    })
  );

  return { ...page, rows };
}

export type RepaymentHistoryFilters = CursorRequest & {
  type?: string;
  query?: string;
  from?: string;
  to?: string;
};

export async function getAdminRepaymentTransactions(
  filters: RepaymentHistoryFilters
): Promise<CursorPage<AdminTransaction>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  const types =
    filters.type && filters.type !== "all"
      ? [filters.type]
      : ["fuel_repayment", "repair_repayment", "rental_repayment"];

  let q = supabase
    .from("admin_transactions_search")
    .select(
      "id, driver_id, vehicle_id, garage_id, vehicle_name, garage_name, type, amount, litres, points_earned, created_at, driver_name"
    )
    .in("type", types);

  if (filters.from) q = q.gte("created_at", filters.from);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `driver_name.ilike.%${term}%,driver_email.ilike.%${term}%,driver_phone.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);

  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );

  return { ...page, rows: page.rows.map(mapActiveTransaction) };
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

export type AdminLeadFilters = CursorRequest & {
  query?: string;
  status?: string;
};

export async function getAdminLeads(
  filters: AdminLeadFilters = {}
): Promise<CursorPage<Lead>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  let q = supabase.from("leads").select("*, services(name)");

  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }

  const term = sanitizeSearchTerm(filters.query);
  if (term) {
    q = q.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
    );
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);
  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  return { ...page, rows: page.rows.map(mapLead) };
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

export type AdminSubmissionFilters = CursorRequest & {
  query?: string;
  status?: string;
};

export async function getAdminSubmissions(
  filters: AdminSubmissionFilters = {}
): Promise<CursorPage<FormSubmission>> {
  const supabase = createAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const direction: CursorDirection =
    filters.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(filters.cursor);

  const term = sanitizeSearchTerm(filters.query);
  const leadRelation = term
    ? "leads!lead_id!inner(full_name, email)"
    : "leads(full_name, email)";

  let q = supabase
    .from("form_submissions")
    .select(`*, ${leadRelation}, form_templates(name)`);

  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }

  if (term) {
    q = q.filter("leads.full_name", "ilike", `%${term}%`);
  }

  if (cursor) q = q.or(cursorFilter(cursor, direction));

  const { data, error } = await q
    .order("created_at", { ascending: direction === "prev" })
    .order("id", { ascending: direction === "prev" })
    .limit(pageSize + 1);

  if (error) throw new Error(error.message);
  const page = buildCursorPage(
    (data ?? []) as Record<string, unknown>[],
    direction,
    pageSize,
    Boolean(cursor)
  );
  return { ...page, rows: page.rows.map(mapSubmission) };
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
