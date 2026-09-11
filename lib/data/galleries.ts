import { hasSupabaseConfig, createReadonlyClient } from "@/lib/supabase/readonly";
import type { GalleryImage } from "@/lib/data/types";

function mapRow(row: Record<string, unknown>): GalleryImage {
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

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!hasSupabaseConfig()) return [];

  try {
    const supabase = createReadonlyClient();
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return [];
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return [];
  }
}