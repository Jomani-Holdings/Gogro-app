"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/login/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="space-y-5">
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

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-textdark mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-navy hover:text-orange"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-textdark/70">
        New to Go Gro?{" "}
        <Link href="/apply" className="text-orange font-semibold hover:underline">
          Join Go Gro
        </Link>
      </p>
    </form>
  );
}
