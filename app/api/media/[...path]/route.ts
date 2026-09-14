import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GALLERY_BUCKET } from "@/lib/media";

export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = Array.isArray(path) ? path : [path];
  const key = segments.join("/");

  if (!key || !key.startsWith(`${GALLERY_BUCKET}/`)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(GALLERY_BUCKET).download(key);

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || "application/octet-stream";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
      "Content-Length": String(buffer.byteLength),
    },
  });
}