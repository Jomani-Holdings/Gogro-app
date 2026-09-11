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
  description: string | null;
};

export type VehicleStatus = "active" | "maintenance" | "off_road";

export type Vehicle = {
  id: string;
  make_model: string;
  registration: string;
  driver_id: string | null;
  driver_name: string | null;
  owner_name: string | null;
  category: string | null;
  weekly_rental: number | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
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
  | "license_disc"
  | "vehicle_image"
  | "uber_profile"
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
    label: "Uber Profile Screenshot",
    description: "A screenshot of your Uber profile with your personal details.",
  },
  {
    value: "proof_of_residence",
    label: "Proof of Residence",
    description: "A recent proof of residence document.",
  },
  {
    value: "selfie",
    label: "Selfie for Driver Profile",
    description: "A selfie image for your driver profile.",
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
