"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import type { FormField } from "@/lib/data/types";
import type { Garage } from "@/lib/data/types";
import {
  DynamicForm,
  type DynamicFormSubmitResult,
} from "@/app/components/apply/DynamicForm";
import {
  submitPublicForm,
  createPasswordForSubmission,
} from "@/app/apply/form/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";

export function PublicFormPortal({
  submissionId,
  token,
  fields,
  garages,
  initialData,
  termsHtml,
  alreadySubmitted,
  confirmationMessage,
}: {
  submissionId: string;
  token: string;
  fields: FormField[];
  garages: Garage[];
  initialData: Record<string, unknown>;
  termsHtml: string;
  alreadySubmitted: boolean;
  confirmationMessage?: string;
}) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(
    data: Record<string, unknown>
  ): Promise<DynamicFormSubmitResult> {
    setSubmitting(true);
    setError(null);
    const res = await submitPublicForm(submissionId, token, data);
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setShowPassword(true);
    } else {
      setError(res.message ?? "Something went wrong. Please try again.");
    }
    return res;
  }

  async function handleCreatePassword() {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    const res = await createPasswordForSubmission(
      submissionId,
      token,
      password
    );
    setSavingPassword(false);
    if (res.ok) {
      router.push("/dashboard/client");
    } else {
      setPasswordError(res.message ?? "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-grey/40 rounded-2xl p-10 text-center">
          <div className="bg-success/10 rounded-full h-16 w-16 mx-auto flex items-center justify-center text-success mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-textdark">
            Application received!
          </h2>
          <p className="text-textdark/70 mt-3">
            {confirmationMessage ??
              "Your application has been received. Our team will be in touch."}
          </p>
        </div>

        {showPassword && (
          <div className="bg-white border border-navy/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-navy">
              Create a password to track your status
            </h2>
            <p className="text-textdark/70 mt-2">
              Set a password to log in and see the progress of your application.
            </p>

            {passwordError ? (
              <p className="mt-4 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                {passwordError}
              </p>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-textdark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((v) => !v)}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textdark/50 hover:text-textdark"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-textdark mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Repeat password"
                    className={`${inputClass} pr-11`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((v) => !v)}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textdark/50 hover:text-textdark"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={savingPassword}
              onClick={handleCreatePassword}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
            >
              {savingPassword ? "Setting password…" : "Set password"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-grey/40 rounded-2xl p-6 md:p-8">
        <DynamicForm
          fields={fields}
          garages={garages}
          initialData={initialData}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>

      {termsHtml ? (
        <div
          className="text-sm text-textdark/70 prose prose-sm max-w-none [&_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
      ) : null}
    </div>
  );
}