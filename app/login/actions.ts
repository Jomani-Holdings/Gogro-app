"use server";

import { redirect } from "next/navigation";
import {
  clearAuthAttempts,
  isRateLimited,
  recordAuthAttempt,
} from "@/lib/auth-attempts";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  if (await isRateLimited(email, "login")) {
    return {
      error:
        "Too many failed login attempts. Please try again in 15 minutes.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordAuthAttempt(email, "login", false);
    return { error: "Invalid email or password. Please try again." };
  }

  await recordAuthAttempt(email, "login", true);
  await clearAuthAttempts(email, "login");

  redirect("/dashboard");
}
