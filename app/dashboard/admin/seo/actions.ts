"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServices } from "@/lib/data/services";

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

export async function saveSeoMeta(formData: FormData): Promise<void> {
  const routePath = String(formData.get("route_path") ?? "");
  const admin = createAdminClient();

  const patch = {
    page_title: clean(formData.get("page_title")),
    meta_title: clean(formData.get("meta_title")),
    meta_description: clean(formData.get("meta_description")),
    og_title: clean(formData.get("og_title")),
    og_description: clean(formData.get("og_description")),
    og_image_url: clean(formData.get("og_image_url")),
    canonical_path: clean(formData.get("canonical_path")),
    noindex: formData.get("noindex") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("seo_meta")
    .upsert({ route_path: routePath, ...patch }, { onConflict: "route_path" });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/seo");
  revalidatePath(routePath === "/" ? "/" : routePath);
  redirect("/dashboard/admin/seo");
}

export async function syncSeoRoutes(): Promise<void> {
  const admin = createAdminClient();

  const staticSeeds: { route_path: string; page_title: string; meta_title: string; meta_description: string }[] = [
    { route_path: "/", page_title: "Go Gro Mobility", meta_title: "Go Gro Mobility | Mobility Solutions That Move You Forward", meta_description: "Fuel credit, vehicle rentals, management and repairs. All in one platform. Built for drivers." },
    { route_path: "/about", page_title: "About Us | Go Gro Mobility", meta_title: "About Us | Go Gro Mobility", meta_description: "Learn about Go Gro Mobility — a South African mobility company helping drivers and entrepreneurs move, operate and grow." },
    { route_path: "/services", page_title: "Our Services | Go Gro Mobility", meta_title: "Our Services | Go Gro Mobility", meta_description: "Explore fuel credit, vehicle rentals, vehicle management and repairs from Go Gro Mobility." },
    { route_path: "/gallery", page_title: "Gallery | Go Gro Mobility", meta_title: "Gallery | Go Gro Mobility", meta_description: "See Go Gro Mobility in action — fuel partners, vehicles, drivers and events." },
    { route_path: "/contact", page_title: "Contact Us | Go Gro Mobility", meta_title: "Contact Us | Go Gro Mobility", meta_description: "Get in touch with Go Gro Mobility. We are here to help drivers and mobility entrepreneurs grow." },
    { route_path: "/how-it-works", page_title: "How It Works | Go Gro Mobility", meta_title: "How It Works | Go Gro Mobility", meta_description: "Learn how Go Gro Mobility fuel credit, rentals and driver support work." },
    { route_path: "/rewards", page_title: "Driver Rewards | Go Gro Mobility", meta_title: "Driver Rewards | Go Gro Mobility", meta_description: "Discover Go Gro driver rewards and benefits." },
    { route_path: "/partners", page_title: "Partners | Go Gro Mobility", meta_title: "Partners | Go Gro Mobility", meta_description: "Our network of partner garages and mobility service providers." },
    { route_path: "/apply", page_title: "Apply Now | Go Gro Mobility", meta_title: "Apply Now | Go Gro Mobility", meta_description: "Apply to join Go Gro Mobility and access fuel credit, vehicle rentals and more." },
  ];

  const services = await getServices();
  const serviceSeeds = services.map((service) => ({
    route_path: `/services/${service.slug}`,
    page_title: `${service.name} | Go Gro Mobility`,
    meta_title: `${service.name} | Go Gro Mobility`,
    meta_description: service.description ?? undefined,
  }));

  const existing = await admin.from("seo_meta").select("route_path");
  const existingPaths = new Set(
    ((existing.data ?? []) as { route_path: string }[]).map((row) => row.route_path)
  );

  const rows = [...staticSeeds, ...serviceSeeds].filter(
    (row) => !existingPaths.has(row.route_path)
  );

  if (rows.length > 0) {
    const { error } = await admin.from("seo_meta").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/seo");
}