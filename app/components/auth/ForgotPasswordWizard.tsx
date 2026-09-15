"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetCode,
  verifyPasswordResetCode,
  resetPasswordWithCode,
} from "@/app/forgot-password/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

function Message({
  state,
}: {
  state: { ok: boolean; message?: string; error?: string } | null;
}) {
  if (!state) return null;
  const ok = state.ok && !state.error;
  return (
    <p
      className={`rounded-lg px-4 py-3 text-sm border ${
        ok
          ? "bg-success/10 border-success/30 text-success"
          : "bg-error/10 border-error/30 text-error"
      }`}
    >
      {ok ? state.message : state.error}
    </p>
  );
}

export function ForgotPasswordWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordResetCode,
    null
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyPasswordResetCode,
    null
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordWithCode,
    null
  );

  return (
    <div>
      <ol className="flex items-center gap-2 mb-6 text-xs text-textdark/50">
        {[1, 2, 3].map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                step === s
                  ? "bg-orange text-white"
                  : s < step
                    ? "bg-success/20 text-success"
                    : "bg-grey/40 text-textdark/60"
              }`}
            >
              {s}
            </span>
            {s === 1 ? "Email" : s === 2 ? "Code" : "Password"}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <form action={requestAction} className="space-y-5">
          <Message state={requestState} />
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={requestPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
          >
            {requestPending ? "Sending…" : "Send reset code"}
          </button>
          {requestState?.ok ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
            >
              I have a code — continue
            </button>
          ) : null}
        </form>
      ) : null}

      {step === 2 ? (
        <form action={verifyAction} className="space-y-5">
          <Message state={verifyState} />
          <input type="hidden" name="email" value={email} />
          <div>
            <label htmlFor="code" className={labelClass}>
              Reset code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              maxLength={6}
              className={`${inputClass} text-center tracking-[0.5em] font-mono`}
            />
          </div>
          <button
            type="submit"
            disabled={verifyPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
          >
            {verifyPending ? "Verifying…" : "Verify code"}
          </button>
          {verifyState?.ok ? (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
            >
              Continue
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-sm text-textdark/60 hover:text-textdark"
          >
            Resend code
          </button>
        </form>
      ) : null}

      {step === 3 ? (
        <form action={resetAction} className="space-y-5">
          <Message state={resetState} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="code" value={code} />
          <div>
            <label htmlFor="password" className={labelClass}>
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Re-enter password"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={resetPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
          >
            {resetPending ? "Resetting…" : "Reset password"}
          </button>
          {resetState?.ok ? (
            <Link
              href="/login"
              className="block w-full text-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
            >
              Back to login
            </Link>
          ) : null}
        </form>
      ) : null}

      <p className="mt-6 text-center text-sm text-textdark/70">
        Remembered it?{" "}
        <Link href="/login" className="text-orange font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}