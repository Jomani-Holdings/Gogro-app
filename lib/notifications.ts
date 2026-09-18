import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationInput = {
  title: string;
  body?: string;
  link?: string;
  type?: string;
};

export async function notifyUser(
  userId: string | null | undefined,
  input: NotificationInput
) {
  if (!userId) return;
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    type: input.type ?? null,
  });
}

export async function notifyAllAdmins(input: NotificationInput) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", "admin");
  const userIds = (data ?? [])
    .map((row) => String((row as { user_id: string }).user_id))
    .filter(Boolean);
  if (userIds.length === 0) return;
  await admin.from("notifications").insert(
    userIds.map((userId) => ({
      user_id: userId,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      type: input.type ?? null,
    }))
  );
}