import type { JSONContent } from "@tiptap/core";

export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  features: string[];
  detail_content: JSONContent | null;
  sort_order: number;
  status: string;
};

export type PartnerType = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
};

export type Garage = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  partner_type_id: string | null;
  active: boolean;
  sort_order: number;
  image_path: string | null;
  alt_text: string | null;
  description: string | null;
};

export type VehicleStatus = "active" | "maintenance" | "off_road";

export type VehicleOwnership = "own" | "rental" | "managed";

export type Vehicle = {
  id: string;
  make_model: string;
  registration: string;
  driver_id: string | null;
  driver_name: string | null;
  owner_name: string | null;
  category: string | null;
  ownership_type: VehicleOwnership;
  weekly_rental: number | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
};

export type TransactionType =
  | "fuel_issue"
  | "repair_issue"
  | "rental_fee"
  | "penalty_fee"
  | "fuel_repayment"
  | "repair_repayment"
  | "rental_repayment"
  | "opening_balance"
  | "balance_correction_increase"
  | "balance_correction_decrease";

export const TRANSACTION_TYPES: {
  value: TransactionType;
  label: string;
  affectsLitres: boolean;
}[] = [
  { value: "fuel_issue", label: "Fuel Issue", affectsLitres: true },
  { value: "repair_issue", label: "Repair Issue", affectsLitres: false },
  { value: "rental_fee", label: "Rental Fee", affectsLitres: false },
  { value: "penalty_fee", label: "Penalty Fee", affectsLitres: false },
  { value: "fuel_repayment", label: "Fuel Repayment", affectsLitres: false },
  { value: "repair_repayment", label: "Repair Repayment", affectsLitres: false },
  { value: "rental_repayment", label: "Rental Repayment", affectsLitres: false },
  { value: "opening_balance", label: "Opening Balance", affectsLitres: false },
  { value: "balance_correction_increase", label: "Balance Correction (+)", affectsLitres: false },
  { value: "balance_correction_decrease", label: "Balance Correction (−)", affectsLitres: false },
];

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  fuel_issue: "Fuel Issue",
  repair_issue: "Repair Issue",
  rental_fee: "Rental Fee",
  penalty_fee: "Penalty Fee",
  fuel_repayment: "Fuel Repayment",
  repair_repayment: "Repair Repayment",
  rental_repayment: "Rental Repayment",
  opening_balance: "Opening Balance",
  balance_correction_increase: "Balance Correction (+)",
  balance_correction_decrease: "Balance Correction (−)",
};

export type Transaction = {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  garage_id: string | null;
  vehicle_name: string | null;
  garage_name: string | null;
  type: TransactionType;
  amount: number;
  litres: number | null;
  created_at: string;
};

export type DashboardStats = {
  activeDrivers: number;
  fuelIssuedThisCycle: { amount: number; litres: number };
  totalOutstanding: number;
  repaymentRate: number;
  overdueAccounts: number;
  accountsOverLimit: number;
  vehiclesUnderManagement: number;
  rentalVehicles: number;
};

export type DashboardActiveDriver = {
  id: string;
  full_name: string | null;
  email: string | null;
  driver_balance: number;
  vehicle: { id: string; make_model: string; registration: string } | null;
  fuel_used_this_month: number;
  weekly_fuel_limit: number;
  weekly_fuel_issued: number;
  next_payment_due: string | null;
  is_overdue: boolean;
};

export type FuelUsageByGarage = {
  garage_id: string | null;
  garage_name: string | null;
  litres: number;
  amount: number;
};

export type TopDebtor = {
  id: string;
  full_name: string | null;
  driver_balance: number;
  total_balance: number;
};

export type PageRecord = {
  id: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  status: string;
};

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export type FormField = {
  key: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  options?: string[];
  optionsSource?: "garages";
  placeholder?: string;
  helper?: string;
  showWhen?: Record<string, string>;
};

export type FormTemplate = {
  id: string;
  slug: string;
  service_id: string | null;
  name: string;
  status: string;
  intro_content: JSONContent | null;
  field_schema: FormField[];
  terms_content: JSONContent | null;
  confirmation_message: string | null;
  email_template_slug: string | null;
  contract_document_path: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  user_id: string | null;
  service_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  source: string | null;
  notes: string | null;
  assigned_to: string | null;
  service_name: string | null;
  created_at: string;
  updated_at: string;
};

export type FormSubmission = {
  id: string;
  lead_id: string;
  form_template_id: string;
  status: string;
  data: Record<string, unknown>;
  access_token: string | null;
  access_token_expires_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string | null;
  email?: string | null;
  template_name?: string | null;
};

export type Communication = {
  id: string;
  lead_id: string;
  type: "email" | "sms" | "note" | "call";
  direction: "inbound" | "outbound";
  subject: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  sent_at: string;
};

export type GalleryImage = {
  id: string;
  storage_path: string;
  filename: string;
  caption: string | null;
  alt_text: string | null;
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SeoMeta = {
  id: string;
  route_path: string;
  page_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_path: string | null;
  noindex: boolean;
  updated_at: string;
};

export type DocumentCategory =
  | "id_copy"
  | "drivers_license_prdp"
  | "license_disc"
  | "vehicle_image"
  | "uber_profile"
  | "earnings_statement"
  | "proof_of_residence"
  | "selfie"
  | "signed_contract";

export const DOCUMENT_CATEGORIES: {
  value: DocumentCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "id_copy",
    label: "Copy of ID / Passport",
    description: "A clear copy of your South African ID or passport.",
  },
  {
    value: "drivers_license_prdp",
    label: "Driver's License + PrDP",
    description: "A clear copy of your valid South African driver's license with PrDP.",
  },
  {
    value: "license_disc",
    label: "Vehicle License Disc",
    description: "A copy of your current vehicle license disc.",
  },
  {
    value: "vehicle_image",
    label: "Image of the Vehicle",
    description: "A photo showing the vehicle.",
  },
  {
    value: "uber_profile",
    label: "eHailing Profile Screenshot",
    description: "A screenshot of your Uber/Bolt/e-hailing driver profile.",
  },
  {
    value: "earnings_statement",
    label: "Latest Earnings Statement",
    description: "Your latest driver earnings statement — preferably the last 4 weeks.",
  },
  {
    value: "proof_of_residence",
    label: "Proof of Residence",
    description: "A recent proof of residence document (not older than 3 months).",
  },
  {
    value: "selfie",
    label: "Selfie for Driver Profile",
    description: "A recent, clear selfie photograph for your driver profile.",
  },
  {
    value: "signed_contract",
    label: "Signed Contract",
    description: "Your signed contract agreement.",
  },
];

export type Document = {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  category: DocumentCategory;
  filename: string;
  storage_path: string;
  status: "pending" | "approved" | "rejected";
  uploaded_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
