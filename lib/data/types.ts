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
