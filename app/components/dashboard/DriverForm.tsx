"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminDriver } from "@/lib/data/admin";
import {
  createDriver,
  updateDriver,
} from "@/app/dashboard/admin/drivers/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

export function DriverForm({
  driver,
  isNew,
  garages,
}: {
  driver: AdminDriver | null;
  isNew: boolean;
  garages: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(driver?.full_name ?? "");
  const [email, setEmail] = useState(driver?.email ?? "");
  const [phone, setPhone] = useState(driver?.phone ?? "");
  const [status, setStatus] = useState(driver?.driver_status ?? "pending");
  const [carMakeModel, setCarMakeModel] = useState(driver?.car_make_model ?? "");
  const [carRegistration, setCarRegistration] = useState(
    driver?.car_registration ?? ""
  );
  const [creditLimit, setCreditLimit] = useState(
    driver?.credit_limit ?? null
  );
  const [fuelCode, setFuelCode] = useState(driver?.fuel_code ?? "");
  const [fuelGarageId, setFuelGarageId] = useState(
    driver?.fuel_garage_id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function buildFormData() {
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("driver_status", status);
    formData.append("car_make_model", carMakeModel);
    formData.append("car_registration", carRegistration);
    formData.append(
      "credit_limit",
      creditLimit === null ? "" : String(creditLimit)
    );
    formData.append("fuel_code", fuelCode);
    formData.append("fuel_garage_id", fuelGarageId);
    return formData;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isNew) {
        const result = await createDriver(buildFormData());
        if (!result.ok) {
          setError(result.error ?? "Something went wrong.");
          setSubmitting(false);
          return;
        }
        setTempPassword(result.tempPassword ?? null);
      } else if (driver) {
        const result = await updateDriver(driver.id, buildFormData());
        if (!result.ok) {
          setError(result.error ?? "Something went wrong.");
          setSubmitting(false);
          return;
        }
        router.push(`/dashboard/admin/drivers/${driver.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  if (tempPassword) {
    return (
      <div className="max-w-xl bg-white border border-grey/40 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-textdark">Driver created!</h2>
        <p className="text-textdark/70 mt-2">
          Share this temporary password with the driver. They should log in and
          change it as soon as possible.
        </p>
        <div className="mt-4 rounded-lg bg-grey/20 p-4 font-mono text-lg text-textdark text-center select-all">
          {tempPassword}
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard/admin/drivers"
            className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90"
          >
            Back to drivers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Personal</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="full_name" className={labelClass}>
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
              disabled={!isNew}
            />
          </div>
          <div>
            <label htmlFor="driver_status" className={labelClass}>
              Activity Status
            </label>
            <select
              id="driver_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              {STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Vehicle &amp; Fuel</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="car_make_model" className={labelClass}>
              Car Make / Model
            </label>
            <input
              id="car_make_model"
              type="text"
              value={carMakeModel}
              onChange={(e) => setCarMakeModel(e.target.value)}
              className={inputClass}
              placeholder="e.g. Toyota Corolla 2019"
            />
          </div>
          <div>
            <label htmlFor="car_registration" className={labelClass}>
              Car Registration
            </label>
            <input
              id="car_registration"
              type="text"
              value={carRegistration}
              onChange={(e) => setCarRegistration(e.target.value)}
              className={inputClass}
              placeholder="e.g. CA 123 456"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label htmlFor="credit_limit" className={labelClass}>
              Credit Limit
            </label>
            <input
              id="credit_limit"
              type="number"
              min={0}
              step="0.01"
              value={creditLimit ?? ""}
              onChange={(e) =>
                setCreditLimit(e.target.value === "" ? null : Number(e.target.value))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fuel Balance</label>
            <div className="w-full rounded-lg border border-grey/40 bg-offwhite px-4 py-3 text-textdark/80">
              {driver?.fuel_balance != null
                ? `R${Number(driver.fuel_balance).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "R0.00"}
              <span className="block text-xs text-textdark/40 mt-0.5">
                Managed via the ledger
              </span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Repair Balance</label>
            <div className="w-full rounded-lg border border-grey/40 bg-offwhite px-4 py-3 text-textdark/80">
              {driver?.repair_balance != null
                ? `R${Number(driver.repair_balance).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "R0.00"}
              <span className="block text-xs text-textdark/40 mt-0.5">
                Managed via the ledger
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="fuel_code" className={labelClass}>
              Fuel Code
            </label>
            <input
              id="fuel_code"
              type="text"
              value={fuelCode}
              onChange={(e) => setFuelCode(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="fuel_garage_id" className={labelClass}>
            Fuel Garage
          </label>
          <select
            id="fuel_garage_id"
            value={fuelGarageId}
            onChange={(e) => setFuelGarageId(e.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            {garages.map((garage) => (
              <option key={garage.id} value={garage.id}>
                {garage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : isNew ? "Create driver" : "Save changes"}
        </button>
        <Link
          href="/dashboard/admin/drivers"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}