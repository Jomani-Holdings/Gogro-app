"use server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotificationSnapshot } from "@/lib/data/notifications";
import type { NotificationItem } from "@/lib/notification-types";

export async function getMyNotifications(): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const user = await requireUser();
  return getNotificationSnapshot(user.id);
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
