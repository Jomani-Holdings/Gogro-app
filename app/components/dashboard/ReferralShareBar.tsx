"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ReferralShareBar({ code }: { code: string | null }) {
  const [copied, setCopied] = useState(false);

  const message = code
    ? `Join me on Go Gro Mobility! Use my referral code ${code} to sign up.`
    : "Join me on Go Gro Mobility!";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in some browsers; leave the code visible.
    }
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-navy/[0.04] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
      <div>
        <p className="font-semibold text-textdark">Refer a Driver</p>
        <p className="text-sm text-textdark/60">
          Share your unique code and start earning rewards.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-grey/40 bg-white px-4 py-2.5">
          <span className="text-sm font-bold tracking-wide text-navy">
            {code ?? "—"}
          </span>
          <button
            type="button"
            onClick={copyCode}
            disabled={!code}
            aria-label="Copy referral code"
            className="text-textdark/50 hover:text-navy disabled:opacity-40"
          >
            {copied ? (
              <Check size={16} className="text-success" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Share via WhatsApp
        </a>
      </div>
    </div>
  );
}
