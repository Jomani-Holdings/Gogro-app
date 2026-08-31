"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/app/components/ui/Button";
import { getWhatsAppLink, siteConfig } from "@/app/lib/site-config";

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCE_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(REDUCE_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function Hero() {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <section className="relative w-full h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-navy-dark z-0">
        {!reduceMotion ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/video/hero-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="/video/hero-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url(/video/hero-poster.jpg)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-start text-white max-w-5xl">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-balance">
          Mobility Solutions That{" "}
          <span className="text-orange">Move You Forward.</span>
        </h1>
        <p className="text-lg md:text-xl text-offwhite mb-10 max-w-2xl font-light">
          Fuel credit, vehicle rentals, management and repairs.{" "}
          <br className="hidden md:block" />
          All in one platform. Built for drivers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            href={siteConfig.nav.join.href}
            variant="primary"
            className="py-4 px-8"
          >
            Join Go Gro
          </Button>
          <Button
            href={getWhatsAppLink()}
            external
            variant="whiteOutline"
            className="py-4 px-8"
          >
            WhatsApp Us
          </Button>
        </div>
      </div>
    </section>
  );
}
