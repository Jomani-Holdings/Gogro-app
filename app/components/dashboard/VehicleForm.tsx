"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Vehicle, VehicleStatus, VehicleOwnership } from "@/lib/data/types";
import {
  createVehicle,
  updateVehicle,
} from "@/app/dashboard/admin/vehicles/actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

const STATUSES: { value: VehicleStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "off_road", label: "Off-Road" },
];

const OWNERSHIPS: { value: VehicleOwnership; label: string }[] = [
  { value: "managed", label: "Managed" },
  { value: "rental", label: "Rental" },
  { value: "own", label: "Driver-owned" },
];

export function VehicleForm({
  vehicle,
  drivers,
  isNew,
}: {
  vehicle: Vehicle | null;
  drivers: { id: string; full_name: string | null }[];
  isNew: boolean;
}) {
  const router = useRouter();
  const [makeModel, setMakeModel] = useState(vehicle?.make_model ?? "");
  const [registration, setRegistration] = useState(
    vehicle?.registration ?? ""
  );
  const [driverId, setDriverId] = useState(vehicle?.driver_id ?? "");
  const [ownerName, setOwnerName] = useState(vehicle?.owner_name ?? "");
  const [category, setCategory] = useState(vehicle?.category ?? "");
  const [ownershipType, setOwnershipType] = useState<VehicleOwnership>(
    vehicle?.ownership_type ?? "managed"
  );
  const [weeklyRental, setWeeklyRental] = useState<number | null>(
    vehicle?.weekly_rental ?? null
  );
  const [status, setStatus] = useState<VehicleStatus>(
    vehicle?.status ?? "active"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("make_model", makeModel);
    formData.append("registration", registration);
    formData.append("driver_id", driverId);
    formData.append("owner_name", ownerName);
    formData.append("category", category);
    formData.append("ownership_type", ownershipType);
    formData.append("weekly_rental", weeklyRental === null ? "" : String(weeklyRental));
    formData.append("status", status);

    try {
      const result = isNew
        ? await createVehicle(formData)
        : vehicle
          ? await updateVehicle(vehicle.id, formData)
          : null;
      if (!result?.ok) {
        setError(result?.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/dashboard/admin/vehicles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy">Vehicle</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="make_model" className={labelClass}>
              Make / Model
            </label>
            <input
              id="make_model"
              type="text"
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              className={inputClass}
              placeholder="e.g. Suzuki Dzire"
              required
            />
          </div>
          <div>
            <label htmlFor="registration" className={labelClass}>
              Registration
            </label>
            <input
              id="registration"
              type="text"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className={inputClass}
              placeholder="e.g. CA 123 456"
              required
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="owner_name" className={labelClass}>
              Owner
            </label>
            <input
              id="owner_name"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Mr Smith"
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              placeholder="e.g. UberGo, Comfort, Bolt"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="ownership_type" className={labelClass}>
              Ownership
            </label>
            <select
              id="ownership_type"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value as VehicleOwnership)}
              className={inputClass}
            >
              {OWNERSHIPS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
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
        <div>
          <label htmlFor="weekly_rental" className={labelClass}>
            Weekly Rental
          </label>
          <input
            id="weekly_rental"
            type="number"
            min={0}
            step="0.01"
            value={weeklyRental ?? ""}
            onChange={(e) =>
              setWeeklyRental(e.target.value === "" ? null : Number(e.target.value))
            }
            className={inputClass}
            placeholder="e.g. 2500"
          />
        </div>
        <div>
          <label htmlFor="driver_id" className={labelClass}>
            Assigned Driver
          </label>
          <select
            id="driver_id"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name ?? "Unknown"}
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
          {submitting ? "Saving…" : isNew ? "Add vehicle" : "Save changes"}
        </button>
        <Link
          href="/dashboard/admin/vehicles"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}