"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminDriver } from "@/lib/data/admin";
import {
  createDriver,
  updateDriver,
} from "@/app/dashboard/admin/drivers/actions";
import { LogTransactionModal } from "@/app/components/dashboard/LogTransactionModal";

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
  vehicles = [],
}: {
  driver: AdminDriver | null;
  isNew: boolean;
  garages: { id: string; name: string }[];
  vehicles?: { id: string; make_model: string; registration: string }[];
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
  const [weeklyFuelLimit, setWeeklyFuelLimit] = useState<number | null>(
    driver?.weekly_fuel_limit ?? 2000
  );
  const [paymentDueDay, setPaymentDueDay] = useState(
    driver?.payment_due_day ?? "tuesday"
  );
  const [paymentDueTime, setPaymentDueTime] = useState(
    driver?.payment_due_time ?? "13:00"
  );
  const [arrangementDueDate, setArrangementDueDate] = useState(
    driver?.payment_arrangement_due_date ?? ""
  );
  const [arrangementNotes, setArrangementNotes] = useState(
    driver?.payment_arrangement_notes ?? ""
  );
  const [fuelCode, setFuelCode] = useState(driver?.fuel_code ?? "");
  const [fuelGarageId, setFuelGarageId] = useState(
    driver?.fuel_garage_id ?? ""
  );
  const [idNumber, setIdNumber] = useState(driver?.id_number ?? "");
  const [suburb, setSuburb] = useState(driver?.suburb ?? "");
  const [licenseValid, setLicenseValid] = useState(driver?.license_valid ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    driver?.years_experience ?? ""
  );
  const [preferredCategory, setPreferredCategory] = useState(
    driver?.preferred_vehicle_category ?? ""
  );
  const [marketingSource, setMarketingSource] = useState(
    driver?.marketing_source ?? ""
  );
  const isRental = driver?.primary_service === "vehicle-rental";
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
      "weekly_fuel_limit",
      weeklyFuelLimit === null ? "" : String(weeklyFuelLimit)
    );
    formData.append("payment_due_day", paymentDueDay);
    formData.append("payment_due_time", paymentDueTime);
    formData.append("payment_arrangement_due_date", arrangementDueDate);
    formData.append("payment_arrangement_notes", arrangementNotes);
    formData.append("fuel_code", fuelCode);
    formData.append("fuel_garage_id", fuelGarageId);
    formData.append("id_number", idNumber);
    formData.append("suburb", suburb);
    formData.append("license_valid", licenseValid);
    formData.append("years_experience", yearsExperience);
    formData.append("preferred_vehicle_category", preferredCategory);
    formData.append("marketing_source", marketingSource);
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label htmlFor="weekly_fuel_limit" className={labelClass}>
              Fuel Credit
            </label>
            <input
              id="weekly_fuel_limit"
              type="number"
              min={0}
              step="0.01"
              value={weeklyFuelLimit ?? ""}
              onChange={(e) =>
                setWeeklyFuelLimit(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-textdark/50">
              Maximum fuel spend allowed per Tue–Mon cycle. Default R2,000.
            </p>
          </div>
          <div>
            <label className={labelClass}>Driver Balance</label>
            {!isNew && driver ? (
              <LogTransactionModal
                driverId={driver.id}
                driverName={driver.full_name}
                driver={driver}
                vehicles={vehicles}
                garages={garages}
                defaultType="fuel_issue"
                triggerClassName="w-full text-left"
                trigger={
                  <span className="block w-full rounded-lg border border-grey/40 bg-offwhite px-4 py-3 text-textdark/80 transition-colors hover:border-orange/60 hover:bg-orange/5 cursor-pointer">
                    R
                    {Number(driver.driver_balance).toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="block text-xs text-textdark/40 mt-0.5">
                      Unified ledger — click to log a transaction
                    </span>
                  </span>
                }
              />
            ) : (
              <div className="w-full rounded-lg border border-grey/40 bg-offwhite px-4 py-3 text-textdark/80">
                R0.00
                <span className="block text-xs text-textdark/40 mt-0.5">
                  Unified ledger
                </span>
              </div>
            )}
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

      {isRental ? (
        <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-navy">
            Rental Application
          </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="id_number" className={labelClass}>
              ID / Passport Number
            </label>
            <input
              id="id_number"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={inputClass}
              placeholder="e.g. 850101 1234 089"
            />
          </div>
          <div>
            <label htmlFor="suburb" className={labelClass}>
              Area / Suburb
            </label>
            <input
              id="suburb"
              type="text"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className={inputClass}
              placeholder="e.g. Khayelitsha"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="license_valid" className={labelClass}>
              Valid South African License (PrDP)
            </label>
            <select
              id="license_valid"
              value={licenseValid}
              onChange={(e) => setLicenseValid(e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {["Yes", "No", "Other"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="years_experience" className={labelClass}>
              eHailing Experience
            </label>
            <select
              id="years_experience"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {["1 - 3 years", "3 - 6 years", "6 years and more"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="preferred_vehicle_category" className={labelClass}>
              Preferred Vehicle / Category
            </label>
            <select
              id="preferred_vehicle_category"
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {[
                "Hatchback/ Go",
                "Sedan/ Comfort",
                "SUV",
                "7 Seater or more/ XL",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="marketing_source" className={labelClass}>
              How did they hear about us?
            </label>
            <select
              id="marketing_source"
              value={marketingSource}
              onChange={(e) => setMarketingSource(e.target.value)}
              className={inputClass}
            >
              <option value="">Select…</option>
              {["eHailing Groups", "Facebook", "Fellow Driver"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>
      ) : null}

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Payments &amp; Arrangements</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="payment_due_day" className={labelClass}>
              Payment Due Day
            </label>
            <select
              id="payment_due_day"
              value={paymentDueDay}
              onChange={(e) => setPaymentDueDay(e.target.value)}
              className={inputClass}
            >
              {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
                (day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="payment_due_time" className={labelClass}>
              Payment Due Time
            </label>
            <input
              id="payment_due_time"
              type="time"
              value={paymentDueTime}
              onChange={(e) => setPaymentDueTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="payment_arrangement_due_date" className={labelClass}>
              Payment Arrangement Due Date
            </label>
            <input
              id="payment_arrangement_due_date"
              type="date"
              value={arrangementDueDate}
              onChange={(e) => setArrangementDueDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-textdark/50">
              When set, this overrides the normal due date.
            </p>
          </div>
          <div>
            <label htmlFor="payment_arrangement_notes" className={labelClass}>
              Arrangement Notes
            </label>
            <textarea
              id="payment_arrangement_notes"
              rows={2}
              value={arrangementNotes}
              onChange={(e) => setArrangementNotes(e.target.value)}
              className={inputClass}
              placeholder="e.g. Approved payment arrangement for Wednesday."
            />
          </div>
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