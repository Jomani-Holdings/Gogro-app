import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isDev = process.env.NODE_ENV === "development";

const fallbackSupabaseOrigin = "https://bawhymljrkxnxqcotdws.supabase.co";
let supabaseOrigin = fallbackSupabaseOrigin;
let supabaseWsOrigin = fallbackSupabaseOrigin.replace(/^https:/, "wss:");

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    supabaseOrigin = supabaseUrl.origin;
    supabaseWsOrigin = `wss://${supabaseUrl.host}`;
  } catch {
    supabaseOrigin = fallbackSupabaseOrigin;
    supabaseWsOrigin = fallbackSupabaseOrigin.replace(/^https:/, "wss:");
  }
}

function buildCsp(nonce: string): string {
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: ${supabaseOrigin} https://maps.google.com https://fonts.gstatic.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin} https://maps.google.com;
    frame-src https://maps.google.com https://www.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? "" : "upgrade-insecure-requests;"}
  `;

  return csp.replace(/\s{2,}/g, " ").trim();
}

function applySecurityHeaders(response: NextResponse, cspHeader: string) {
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(), usb=()"
  );
  response.headers.set("X-XSS-Protection", "0");
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  applySecurityHeaders(response, cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: requestHeaders } });
          applySecurityHeaders(response, cspHeader);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
