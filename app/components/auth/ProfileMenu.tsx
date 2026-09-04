"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/app/components/auth/useSession";

const menuItemClass =
  "flex items-center gap-3 whitespace-nowrap px-4 py-2.5 text-sm text-textdark transition-colors hover:bg-offwhite";

export function ProfileMenu() {
  const { signedIn, email } = useSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!signedIn) return null;

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:block"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
      >
        <User size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-2 w-64">
          <div className="rounded-xl bg-white border border-grey/40 shadow-xl py-2">
            <div className="px-4 py-2.5 border-b border-grey/30">
              <p className="text-xs text-textdark/50">Signed in as</p>
              <p className="text-sm font-semibold text-textdark truncate">
                {email}
              </p>
            </div>
            <div className="pt-1">
              <Link href="/dashboard" onClick={() => setOpen(false)} className={menuItemClass}>
                <LayoutDashboard size={16} className="text-navy shrink-0" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                <Settings size={16} className="text-navy shrink-0" />
                Settings
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.refresh();
                }}
                className={`${menuItemClass} w-full text-error hover:bg-error/5`}
              >
                <LogOut size={16} className="shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileMenuMobile({ onClose }: { onClose: () => void }) {
  const { signedIn, email } = useSession();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  if (!signedIn) return null;

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-between gap-3 w-full py-3 text-left"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white">
            <User size={16} />
          </span>
          <span className="text-sm text-offwhite truncate max-w-[12rem]">
            {email}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-grey transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 rounded-lg bg-white/5 border border-white/10 p-1">
          <p className="px-3 pt-2 pb-1 text-xs text-grey">Signed in as</p>
          <p className="px-3 pb-2 text-sm text-white truncate">{email}</p>
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-offwhite hover:bg-white/10 rounded-md"
          >
            <LayoutDashboard size={16} className="text-orange shrink-0" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-offwhite hover:bg-white/10 rounded-md"
          >
            <Settings size={16} className="text-orange shrink-0" />
            Settings
          </Link>
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.refresh();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-300 hover:bg-white/10 rounded-md text-left"
          >
            <LogOut size={16} className="shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
