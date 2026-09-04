"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    if (code) {
      void supabase.auth.exchangeCodeForSession(code);
    }
  }, [searchParams]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setStatus({ ok: false, message: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setStatus({ ok: false, message: "Passwords do not match." });
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setStatus({ ok: false, message: error.message });
      return;
    }

    setStatus({ ok: true, message: "Password updated. Redirecting…" });
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {status ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm border ${
            status.ok
              ? "bg-success/10 border-success/30 text-success"
              : "bg-error/10 border-error/30 text-error"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="password" className={labelClass}>
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="confirm" className={labelClass}>
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="container mx-auto px-6 md:px-12 py-16 md:py-20">
      <div className="max-w-md mx-auto bg-white border border-grey/40 rounded-2xl p-8 md:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-navy mb-6">Set a new password</h2>
        <Suspense fallback={<p className="text-textdark/60">Loading…</p>}>
          <ResetPasswordInner />
        </Suspense>
      </div>
    </section>
  );
}
