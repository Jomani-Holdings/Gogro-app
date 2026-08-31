"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { siteConfig } from "@/app/lib/site-config";

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const { nav, logo } = siteConfig;

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute right-0 top-0 h-full w-72 max-w-[80%] bg-navy shadow-xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="h-8 w-auto"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-1">
            <Link
              href={nav.about.href}
              onClick={onClose}
              className="py-3 text-offwhite hover:text-orange font-medium border-b border-white/10"
            >
              {nav.about.label}
            </Link>
            <Link
              href={nav.services.href}
              onClick={onClose}
              className="py-3 text-offwhite hover:text-orange font-medium border-b border-white/10"
            >
              {nav.services.label}
            </Link>
            <Link
              href={nav.rewards.href}
              onClick={onClose}
              className="py-3 text-offwhite hover:text-orange font-medium border-b border-white/10"
            >
              {nav.rewards.label}
            </Link>

            <Link
              href={nav.partners.href}
              onClick={onClose}
              className="py-3 text-offwhite hover:text-orange font-medium border-b border-white/10"
            >
              {nav.partners.label}
            </Link>

            <Link
              href={nav.contact.href}
              onClick={onClose}
              className="py-3 text-offwhite hover:text-orange font-medium border-b border-white/10"
            >
              {nav.contact.label}
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              href={nav.join.href}
              variant="primary"
              className="w-full py-3"
            >
              {nav.join.label}
            </Button>
            <Button
              href={nav.login.href}
              variant="whiteOutline"
              className="w-full py-3"
            >
              {nav.login.label}
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
