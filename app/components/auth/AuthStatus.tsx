"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/Button";

const outlineClass =
  "bg-transparent border border-white text-white hover:bg-orange hover:border-transparent";

export function AuthStatus({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }
    return createClient();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setLoggedIn(Boolean(data.user));
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase || loading || !loggedIn) {
    return (
      <Button href="/login" variant="whiteOutline" className={className}>
        Login
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.refresh();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/60 ${outlineClass} ${className}`}
    >
      Logout
    </button>
  );
}
