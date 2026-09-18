"use server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string | null;
  read: boolean;
  created_at: string;
};

export async function getMyNotifications(): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const user = await requireUser();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, title, body, link, type, read, created_at")
    .eq("user_id", user.id)
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

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const admin = createAdminClient();

  await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return { ok: true };
}