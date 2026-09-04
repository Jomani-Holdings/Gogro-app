"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updatePassword } from "@/app/dashboard/settings-actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export function SettingsForm({
  fullName,
  phone,
  email,
}: {
  fullName: string | null;
  phone: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [status, setStatus] = useState<{
    ok: boolean;
    message?: string;
  } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{
    ok: boolean;
    message?: string;
  } | null>(null);

  async function onProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);
    setStatus(result);
    setProfileBusy(false);
    router.refresh();
  }

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordBusy(true);
    setPasswordStatus(null);
    const formData = new FormData(event.currentTarget);
    const result = await updatePassword(formData);
    setPasswordStatus(result);
    setPasswordBusy(false);
    if (result.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onProfileSubmit}
        className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-navy">Profile</h2>

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
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email ?? ""}
            disabled
            className={`${inputClass} opacity-60`}
          />
        </div>

        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={fullName ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone ?? ""}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={profileBusy}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {profileBusy ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={onPasswordSubmit}
        className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-navy">Change Password</h2>

        {passwordStatus ? (
          <p
            className={`rounded-lg px-4 py-3 text-sm border ${
              passwordStatus.ok
                ? "bg-success/10 border-success/30 text-success"
                : "bg-error/10 border-error/30 text-error"
            }`}
          >
            {passwordStatus.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="password" className={labelClass}>
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={inputClass}
            required
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
            className={inputClass}
            required
          />
        </div>

        <button
          type="submit"
          disabled={passwordBusy}
          className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-6 transition-colors hover:bg-navy-dark disabled:opacity-60"
        >
          {passwordBusy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
