"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({
  title,
  badge,
  actions,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string | null;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-white border border-grey/40 rounded-2xl h-fit">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-6 py-4"
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-navy">
          {title}
          {badge ? (
            <span className="inline-block rounded-full bg-orange/10 text-orange text-xs font-semibold px-2.5 py-0.5">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3">
          {actions}
          <ChevronDown
            size={20}
            className={`text-textdark/50 transition-transform ${
              open ? "" : "-rotate-90"
            }`}
          />
        </span>
      </button>
      {open ? <div className="px-6 pb-6">{children}</div> : null}
    </section>
  );
}