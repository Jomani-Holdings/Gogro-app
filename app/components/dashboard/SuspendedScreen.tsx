"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SuspendedScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-grey/40 rounded-2xl p-8 text-center">
        <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-error/10 text-error mx-auto">
          <ShieldAlert size={28} />
        </span>
        <h1 className="text-2xl font-bold text-textdark mt-5">
          Account suspended
        </h1>
        <p className="text-textdark/70 mt-2">
          Your account is currently suspended. Please contact support if you
          believe this is a mistake.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard/client/support"
            className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90"
          >
            Contact support
          </Link>
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.replace("/");
              router.refresh();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy text-navy font-semibold py-3 px-6 hover:bg-navy/5"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}