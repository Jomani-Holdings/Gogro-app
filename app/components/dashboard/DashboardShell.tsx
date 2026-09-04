"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  User,
  LayoutDashboard,
  FileText,
  Users,
  Wrench,
  Layers,
  MapPin,
  Mail,
  Home,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/app/lib/site-config";
import { LogoutButton } from "@/app/components/dashboard/LogoutButton";
import type { NavItem } from "@/lib/dashboard-nav";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  Wrench,
  Layers,
  MapPin,
  Mail,
  Home,
  LifeBuoy,
  Settings,
};

export function DashboardShell({
  navItems,
  role,
  fullName,
  email,
  children,
}: {
  navItems: NavItem[];
  role: "driver" | "admin";
  fullName: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const roleLabel = role === "admin" ? "Admin Console" : "Driver Portal";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
        <Image
          src={siteConfig.logo.src}
          alt={siteConfig.logo.alt}
          width={siteConfig.logo.width}
          height={siteConfig.logo.height}
          priority
          className="h-8 w-auto"
        />
      </div>

      <p className="px-6 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
        {roleLabel}
      </p>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${active ? "text-orange" : "text-white/50"}`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white shrink-0">
            <User size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {fullName || "Account"}
            </p>
            <p className="text-xs text-white/50 truncate">{email ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-3 flex flex-col gap-1">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive("/dashboard/settings")
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={16} className="text-white/50 shrink-0" />
          Settings
        </Link>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-offwhite">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-navy z-30">
        {sidebar}
      </aside>

      <header className="lg:hidden sticky top-0 z-40 bg-navy border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-white">{roleLabel}</span>
          <span className="w-9" />
        </div>
      </header>

      <div className="lg:pl-64">
        <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-grey/30">
          <div className="container mx-auto px-6 flex items-center justify-between h-16">
            <h1 className="text-base font-semibold text-textdark">{roleLabel}</h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-navy text-white shrink-0">
                <User size={16} />
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-textdark leading-tight">
                  {fullName || "Account"}
                </p>
                <p className="text-xs text-textdark/50 leading-tight truncate max-w-[16rem]">
                  {email ?? ""}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[80%] bg-navy shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end h-16 px-4 border-b border-white/10">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-[calc(100%-4rem)]">{sidebar}</div>
        </div>
      </div>
    </div>
  );
}
