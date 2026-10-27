import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

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
  if (!authHeader || !safeEqual(authHeader, `Bearer ${secret}`)) {
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

  const { data: updated, error: updateError } = await admin
    .from("profiles")
    .update({
      driver_status: "inactive",
      suspended: false,
      updated_at: new Date().toISOString(),
    })
    .eq("role", "client")
    .eq("driver_status", "active")
    .gt("fuel_balance", 0)
    .in("id", ids)
    .select("id");

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    deactivated: updated?.length ?? 0,
  });
}
