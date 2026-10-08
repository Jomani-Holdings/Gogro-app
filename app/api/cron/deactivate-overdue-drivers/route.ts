import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Vercel Cron runs this every Monday (see vercel.json). Any active driver who
// still owes fuel money is moved to `inactive` so they must settle fuel debt
// before fuel credit is restored. Repair/rental/penalty debt does not block.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: affected, error: selectError } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "client")
    .eq("driver_status", "active")
    .gt("fuel_balance", 0);

  if (selectError) {
    return NextResponse.json(
      { ok: false, error: selectError.message },
      { status: 500 }
    );
  }

  const ids = (affected ?? []).map((row) => String((row as { id: string }).id));

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, deactivated: 0 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      driver_status: "inactive",
      suspended: false,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deactivated: ids.length });
}
