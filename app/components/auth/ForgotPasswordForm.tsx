"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/login/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success">
          {state.message}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-textdark mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-textdark/70">
        Remembered it?{" "}
        <Link href="/login" className="text-orange font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
