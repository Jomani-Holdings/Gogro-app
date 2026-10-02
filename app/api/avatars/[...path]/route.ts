import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AVATARS_BUCKET } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = Array.isArray(path) ? path : [path];
  const key = segments.join("/");

  if (!key || !key.startsWith(`${AVATARS_BUCKET}/`)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Avatars are stored under avatars/<user_id>/<filename>.
  const ownerId = segments[1];
  if (!ownerId) return new NextResponse("Not found", { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const admin = createAdminClient();
  const isOwner = user.id === ownerId;

  if (!isOwner) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const isAdmin = profile?.role === "admin";
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });
  }

  const { data, error } = await admin.storage
    .from(AVATARS_BUCKET)
    .download(key);

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || "image/jpeg";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(buffer.byteLength),
    },
  });
}