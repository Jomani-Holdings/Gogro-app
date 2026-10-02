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
  ClipboardList,
  FilePlus,
  Globe,
  Images,
  Search,
  Car,
  Receipt,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/app/lib/site-config";
import { LogoutButton } from "@/app/components/dashboard/LogoutButton";
import { NotificationBell } from "@/app/components/dashboard/NotificationBell";
import { ClientHeaderClock } from "@/app/components/dashboard/ClientHeaderClock";
import type { NavItem, NavGroup } from "@/lib/dashboard-nav";

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
  ClipboardList,
  FilePlus,
  Globe,
  Images,
  Search,
  Car,
  Receipt,
};

export function DashboardShell({
  navItems,
  navGroups,
  role,
  fullName,
  email,
  children,
}: {
  navItems: NavItem[];
  navGroups?: NavGroup[];
  role: "client" | "admin";
  fullName: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(true);
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

  const roleLabel = role === "admin" ? "Admin Console" : "Client Portal";

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/dashboard/admin" || href === "/dashboard/client") {
      return false;
    }
    return pathname.startsWith(href + "/");
  };

  function renderNavItem(item: NavItem, small = false) {
    const Icon = iconMap[item.icon] ?? LayoutDashboard;
    const active = isActive(item.href);
    const external = item.href.startsWith("http");
    const className = `flex items-center gap-3 px-3 ${
      small ? "py-2 rounded-lg text-sm font-medium" : "py-2.5 rounded-lg text-sm font-medium"
    } transition-colors ${
      active
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;
    const content = (
      <>
        <Icon
          size={small ? 15 : 16}
          className={`shrink-0 ${active ? "text-orange" : "text-white/50"}`}
        />
        {item.label}
      </>
    );

    if (external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileOpen(false)}
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  const sidebarBody = (withLogo: boolean) => (
    <div className="flex h-full flex-col">
      {withLogo ? (
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          <Link href="/" className="inline-flex items-center" aria-label="Go Gro home">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              priority
              className="h-8 w-auto"
            />
          </Link>
        </div>
      ) : null}

      <p className="px-6 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
        {roleLabel}
      </p>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.href}>{renderNavItem(item)}</li>
          ))}

          {(navGroups ?? []).map((group) => {
            const GroupIcon = iconMap[group.icon] ?? Globe;
            const groupActive = group.items.some((item) => isActive(item.href));
            return (
              <li key={group.label} className="mt-4">
                <button
                  type="button"
                  onClick={() => setSiteOpen((prev) => !prev)}
                  aria-expanded={siteOpen}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    groupActive
                      ? "text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <GroupIcon size={16} className="text-white/50 shrink-0" />
                    {group.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-white/50 transition-transform ${
                      siteOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>

                {siteOpen && (
                  <ul className="flex flex-col gap-1 mt-1 pl-6 border-l border-white/10 ml-5">
                    {group.items.map((item) => (
                      <li key={item.href}>{renderNavItem(item, true)}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

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

  if (role === "client") {
    return (
      <div className="min-h-screen bg-offwhite">
        <header className="sticky top-0 z-40 bg-navy border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
              >
                <Menu size={20} />
              </button>
              <Link href="/" className="inline-flex items-center" aria-label="Go Gro home">
                <Image
                  src={siteConfig.logo.src}
                  alt={siteConfig.logo.alt}
                  width={siteConfig.logo.width}
                  height={siteConfig.logo.height}
                  priority
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <ClientHeaderClock />
          </div>
        </header>

        <aside className="hidden lg:block fixed top-16 bottom-0 left-0 w-64 bg-navy z-30">
          {sidebarBody(false)}
        </aside>

        <div className="lg:pl-64">
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

            <div className="h-[calc(100%-4rem)]">{sidebarBody(false)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-navy z-30">
        {sidebarBody(true)}
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
          <NotificationBell onDark />
        </div>
      </header>

      <div className="lg:pl-64">
        <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-grey/30">
          <div className="container mx-auto px-6 flex items-center justify-between h-16">
            <h2 className="text-base font-semibold text-textdark">{roleLabel}</h2>
            <div className="flex items-center gap-3">
              <NotificationBell />
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

          <div className="h-[calc(100%-4rem)]">{sidebarBody(true)}</div>
        </div>
      </div>
    </div>
  );
}