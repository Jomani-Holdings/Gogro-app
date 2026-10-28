import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

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

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
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

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), payment=(), usb=()",
          },
          {
            key: "X-XSS-Protection",
            value: "0",
          },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);