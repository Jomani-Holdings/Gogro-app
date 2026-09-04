"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { MobileNav } from "@/app/components/MobileNav";
import { ProfileMenu } from "@/app/components/auth/ProfileMenu";
import { useSession } from "@/app/components/auth/useSession";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/app/lib/site-config";

function MenuIcon() {
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
        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
      />
    </svg>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signedIn } = useSession();
  const router = useRouter();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const { nav, logo } = siteConfig;

  return (
    <header className="sticky top-0 z-40 bg-navy border-b border-white/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              priority
              className="h-9 w-auto md:h-10"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href={nav.about.href}
              className="text-offwhite hover:text-orange font-medium"
            >
              {nav.about.label}
            </Link>
            <Link
              href={nav.services.href}
              className="text-offwhite hover:text-orange font-medium"
            >
              {nav.services.label}
            </Link>
            <Link
              href={nav.rewards.href}
              className="text-offwhite hover:text-orange font-medium"
            >
              {nav.rewards.label}
            </Link>

            <Link
              href={nav.partners.href}
              className="text-offwhite hover:text-orange font-medium"
            >
              {nav.partners.label}
            </Link>

            <Link
              href={nav.contact.href}
              className="text-offwhite hover:text-orange font-medium"
            >
              {nav.contact.label}
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {signedIn ? (
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.refresh();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/60 bg-transparent border border-white text-white hover:bg-orange hover:border-transparent px-5 py-2.5"
              >
                Logout
              </button>
            ) : (
              <>
                <Button href={nav.join.href} variant="primary" className="px-5 py-2.5">
                  {nav.join.label}
                </Button>
                <Button href="/login" variant="whiteOutline" className="px-5 py-2.5">
                  Login
                </Button>
              </>
            )}
            <ProfileMenu />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={closeMobile} />
    </header>
  );
}
