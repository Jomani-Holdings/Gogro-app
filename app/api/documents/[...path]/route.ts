import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = Array.isArray(path) ? path : [path];
  const key = segments.join("/");

  if (!key || !key.startsWith(`${DOCUMENTS_BUCKET}/`)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isContract = segments[1] === "contracts";

  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const isAdmin = profile?.role === "admin";

    if (!isAdmin && !isContract) {
      const { data: doc, error: docError } = await admin
        .from("documents")
        .select("user_id")
        .eq("storage_path", key)
        .maybeSingle();
      if (docError || !doc || String(doc.user_id) !== user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  } else {
    // No session. Only contract templates can be downloaded anonymously via a
    // valid form access token (used by the tokenised public form page).
    if (!isContract) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const formId = segments[2];
    const token = new URL(req.url).searchParams.get("token");
    if (!formId || !token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { data: submission, error: tokenError } = await admin
      .from("form_submissions")
      .select("id")
      .eq("access_token", token)
      .eq("form_template_id", formId)
      .maybeSingle();
    if (tokenError || !submission) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const { data: fileData, error } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .download(key);

  if (error || !fileData) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const contentType = fileData.type || "application/octet-stream";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": "inline",
    },
  });
}