import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { OfflineRetry } from "@/app/components/OfflineRetry";

export const metadata: Metadata = {
  title: "You're Offline | Go Gro Mobility",
  description:
    "You appear to be offline. Check your mobile data or Wi-Fi connection and try again.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <section className="relative min-h-[70vh] bg-navy text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/40" />
      <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <WifiOff size={28} className="text-orange" />
        </div>
        <p className="text-orange font-bold uppercase tracking-widest text-sm mb-4">
          No Connection
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="text-lg text-offwhite max-w-xl mx-auto mb-8 font-light">
          It looks like you&apos;ve lost your connection. Check your mobile data
          or Wi-Fi and try again — we&apos;ll be here when you&apos;re back
          online.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <OfflineRetry />
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-white/10 text-white border border-white/40 hover:bg-transparent hover:border-white py-4 px-8 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
