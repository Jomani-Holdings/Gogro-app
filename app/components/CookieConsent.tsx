"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_NAME = "cookie-consent";

function getConsent(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setConsent(value: "essential" | "all") {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    value
  )}; path=/; max-age=31536000; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reads a client-only cookie after hydration to avoid a server/client
    // mismatch and prevent a flash of the banner for returning users.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getConsent()) setVisible(true);
  }, []);

  function choose(value: "essential" | "all") {
    setConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white border border-grey/40 shadow-xl p-5">
        <p className="text-sm font-semibold text-textdark">
          We use essential cookies to keep Go Gro working.
        </p>
        <p className="mt-1 text-sm text-textdark/70 leading-relaxed">
          We only store what is needed for the site to function. You can read
          more in our{" "}
          <Link
            href="/legal/privacy"
            className="text-orange underline"
            onClick={() => setVisible(false)}
          >
            Privacy Policy
          </Link>
          . When we add analytics tools, we&apos;ll only switch them on if you
          choose to accept.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}