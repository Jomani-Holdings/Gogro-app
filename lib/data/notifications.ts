import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationItem } from "@/lib/notification-types";

export type NotificationSnapshot = {
  items: NotificationItem[];
  unreadCount: number;
};

export async function getNotificationSnapshot(
  userId: string
): Promise<NotificationSnapshot> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, title, body, link, type, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { items: [], unreadCount: 0 };

  const items = ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? ""),
    body: row.body ? String(row.body) : null,
    link: row.link ? String(row.link) : null,
    type: row.type ? String(row.type) : null,
    read: Boolean(row.read),
    created_at: String(row.created_at ?? ""),
  }));

  return {
    items,
    unreadCount: items.filter((item) => !item.read).length,
  };
}
