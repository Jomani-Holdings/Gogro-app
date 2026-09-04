"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

export async function savePage(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const admin = createAdminClient();

  const patch = {
    meta_title: clean(formData.get("meta_title")),
    meta_description: clean(formData.get("meta_description")),
    hero_title: clean(formData.get("hero_title")),
    hero_subtitle: clean(formData.get("hero_subtitle")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("pages").upsert(
    { slug, ...patch },
    { onConflict: "slug" }
  );

  if (!error) {
    revalidatePath("/dashboard/admin/pages");
    revalidatePath(`/${slug === "home" ? "" : slug}`);
  }

  redirect("/dashboard/admin/pages");
}

export async function saveService(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();

  let features: string[] = [];
  const rawFeatures = formData.get("features");
  if (typeof rawFeatures === "string" && rawFeatures.trim()) {
    features = rawFeatures
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const detailContentRaw = formData.get("detail_content");
  let detailContent = null;
  if (typeof detailContentRaw === "string" && detailContentRaw.trim()) {
    try {
      detailContent = JSON.parse(detailContentRaw);
    } catch {
      detailContent = null;
    }
  }

  const patch = {
    name,
    slug,
    description: clean(formData.get("description")),
    icon_name: clean(formData.get("icon_name")),
    features,
    detail_content: detailContent,
    sort_order: Number(formData.get("sort_order") ?? 0),
    status: String(formData.get("status") ?? "published"),
    updated_at: new Date().toISOString(),
  };

  if (id === "new") {
    const { error } = await admin.from("services").insert(patch);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin
      .from("services")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  redirect("/dashboard/admin/services");
}

export async function savePartnerType(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const patch = {
    name: String(formData.get("name") ?? "").trim(),
    slug,
    description: clean(formData.get("description")),
    icon_name: clean(formData.get("icon_name")),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (id === "new") {
    const { error } = await admin.from("partner_types").insert(patch);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin
      .from("partner_types")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/partner-types");
  revalidatePath("/partners");
  redirect("/dashboard/admin/partner-types");
}

export async function saveGarage(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const admin = createAdminClient();

  const patch = {
    name: String(formData.get("name") ?? "").trim(),
    address: clean(formData.get("address")),
    phone: clean(formData.get("phone")),
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : null,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : null,
    partner_type_id: clean(formData.get("partner_type_id")),
    active: formData.get("active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (id === "new") {
    const { error } = await admin.from("garages").insert(patch);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("garages").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/garages");
  revalidatePath("/partners");
  redirect("/dashboard/admin/garages");
}

export async function deleteService(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("services").delete().eq("id", id);
  revalidatePath("/dashboard/admin/services");
  revalidatePath("/services");
  redirect("/dashboard/admin/services");
}

export async function deletePartnerType(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("partner_types").delete().eq("id", id);
  revalidatePath("/dashboard/admin/partner-types");
  redirect("/dashboard/admin/partner-types");
}

export async function deleteGarage(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("garages").delete().eq("id", id);
  revalidatePath("/dashboard/admin/garages");
  redirect("/dashboard/admin/garages");
}
