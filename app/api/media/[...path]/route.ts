import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { GALLERY_BUCKET, REWARDS_BUCKET } from "@/lib/media";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE = "public, max-age=31536000, immutable";
const PRIVATE_CACHE = "private, no-store";

async function isAdminRequest(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = Array.isArray(path) ? path : [path];
  const key = segments.join("/");

  const isGallery = key.startsWith(`${GALLERY_BUCKET}/`);
  const isReward = key.startsWith(`${REWARDS_BUCKET}/`);

  if (!key || (!isGallery && !isReward)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = createAdminClient();
  const bucket = isReward ? REWARDS_BUCKET : GALLERY_BUCKET;
  let cacheControl = PUBLIC_CACHE;

  if (isReward) {
    // Reward images are private until the campaign is published. Teaser
    // artwork is always safe to show.
    const { data: reward } = await admin
      .from("rewards")
      .select("image_path, teaser_image_path, status, publish_at, expires_at")
      .or(`image_path.eq.${key},teaser_image_path.eq.${key}`)
      .maybeSingle();

    if (!reward) {
      return new NextResponse("Not found", { status: 404 });
    }

    const isTeaserArt = reward.teaser_image_path === key;

    if (!isTeaserArt) {
      const adminRequest = await isAdminRequest();
      const publishAt = reward.publish_at
        ? new Date(String(reward.publish_at)).getTime()
        : 0;
      const expiresAt = reward.expires_at
        ? new Date(String(reward.expires_at)).getTime()
        : null;
      const now = Date.now();
      const isPublished =
        reward.status === "scheduled" &&
        now >= publishAt &&
        (expiresAt === null || now < expiresAt);

      if (!adminRequest && !isPublished) {
        return new NextResponse("Not found", { status: 404 });
      }

      if (adminRequest && !isPublished) {
        cacheControl = PRIVATE_CACHE;
      }
    }
  }

  const { data, error } = await admin.storage.from(bucket).download(key);

  if (error || !data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || "application/octet-stream";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
