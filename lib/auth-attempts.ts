import { createAdminClient } from "@/lib/supabase/admin";

export type AuthAttemptAction = "login" | "password_reset";

export const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const AUTH_RATE_LIMIT_WINDOW_MINUTES = 15;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isRateLimited(
  email: string,
  action: AuthAttemptAction,
  maxAttempts = AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  windowMinutes = AUTH_RATE_LIMIT_WINDOW_MINUTES
): Promise<boolean> {
  const admin = createAdminClient();
  const since = new Date(
    Date.now() - windowMinutes * 60 * 1000
  ).toISOString();

  const { count, error } = await admin
    .from("auth_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizeEmail(email))
    .eq("action", action)
    .gte("created_at", since);

  if (error) {
    console.error("Could not check auth attempt limit", error);
    return false;
  }

  return (count ?? 0) >= maxAttempts;
}

export async function recordAuthAttempt(
  email: string,
  action: AuthAttemptAction,
  success: boolean
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("auth_attempts").insert({
    email: normalizeEmail(email),
    action,
    success,
  });

  if (error) {
    console.error("Could not record auth attempt", error);
  }
}

export async function clearAuthAttempts(
  email: string,
  action: AuthAttemptAction
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("auth_attempts")
    .delete()
    .eq("email", normalizeEmail(email))
    .eq("action", action);

  if (error) {
    console.error("Could not clear auth attempts", error);
  }
}
