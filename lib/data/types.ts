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
