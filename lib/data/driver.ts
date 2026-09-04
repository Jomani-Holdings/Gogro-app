import { createClient } from "@/lib/supabase/server";

export type DriverApplication = {
  id: string;
  status: string;
  created_at: string;
  weekly_credit_band: string | null;
  deposit_required: boolean | null;
  garage_name: string | null;
};

export async function getDriverApplication(
  userId: string
): Promise<DriverApplication | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, created_at, weekly_credit_band, deposit_required, garages(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const garage = (row.garages as { name?: string } | null) ?? null;

  return {
    id: String(row.id),
    status: String(row.status ?? "incomplete"),
    created_at: String(row.created_at ?? ""),
    weekly_credit_band: row.weekly_credit_band
      ? String(row.weekly_credit_band)
      : null,
    deposit_required: row.deposit_required ? Boolean(row.deposit_required) : null,
    garage_name: garage?.name ?? null,
  };
}
