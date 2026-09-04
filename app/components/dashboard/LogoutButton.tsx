"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/");
        router.refresh();
      }}
      className="flex items-center gap-3 whitespace-nowrap px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
    >
      <LogOut size={16} className="shrink-0" />
      Sign out
    </button>
  );
}
