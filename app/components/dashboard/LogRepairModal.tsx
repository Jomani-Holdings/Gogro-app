"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { logTransaction } from "@/app/dashboard/admin/transactions/actions";
import type { TransactionType } from "@/lib/data/types";
import type { AdminDriverSearchOption, AdminGarageOption } from "@/lib/data/admin";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export function LogRepairModal({
  drivers,
  vehicles,
  garages,
  triggerLabel = "Log Repair",
  triggerClassName,
}: {
  drivers: AdminDriverSearchOption[];
  vehicles: { id: string; make_model: string; registration: string }[];
  garages: AdminGarageOption[];
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminDriverSearchOption | null>(null);
  const [type, setType] = useState<TransactionType>("repair_issue");
  const [amount, setAmount] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [garageId, setGarageId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      [d.full_name, d.phone, d.email, d.car_registration, d.fuel_code].some(
        (value) => value?.toLowerCase().includes(q)
      )
    );
  }, [drivers, query]);

  const repairGarages = useMemo(
    () => garages.filter((g) => g.partner_type_slug === "service"),
    [garages]
  );

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function openModal() {
    setQuery("");
    setSelected(null);
    setType("repair_issue");
    setAmount("");
    setVehicleId("");
    setGarageId("");
    setCreatedAt("");
    setError(null);
    setSuccess(false);
    setListOpen(false);
    setOpen(true);
  }

  function pickDriver(driver: AdminDriverSearchOption) {
    setSelected(driver);
    setQuery("");
    setListOpen(false);
    setError(null);
    if (driver.car_registration) {
      const registration = driver.car_registration.toLowerCase();
      const match = vehicles.find(
        (vehicle) => vehicle.registration.toLowerCase() === registration
      );
      setVehicleId(match?.id ?? "");
    } else {
      setVehicleId("");
    }
  }

  function clearDriver() {
    setSelected(null);
    setQuery("");
    setListOpen(false);
  }

  function submit() {
    setError(null);
    if (!selected) {
      setError("Please select a driver.");
      return;
    }
    const formData = new FormData();
    formData.append("driver_id", selected.id);
    formData.append("type", type);
    formData.append("amount", amount);
    formData.append("vehicle_id", vehicleId);
    formData.append("garage_id", garageId);
    formData.append("created_at", createdAt);

    startTransition(async () => {
      const result = await logTransaction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 900);
    });
  }

  const submitDisabled =
    pending || !selected || !amount || success;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          triggerClassName ??
          "inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        }
      >
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!pending) setOpen(false);
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-grey/40">
              <h2 className="text-lg font-bold text-textdark">Log Repair</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                disabled={pending}
                className="p-1 rounded-md text-textdark/60 hover:bg-grey/20 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">
              {error ? (
                <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}
              {success ? (
                <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>
                    Repair logged for {selected?.full_name ?? "driver"}. Updating table…
                  </span>
                </div>
              ) : null}

              {!selected ? (
                <div ref={comboRef}>
                  <label className={labelClass}>Driver</label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textdark/40"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setListOpen(true);
                        setError(null);
                      }}
                      onFocus={() => setListOpen(true)}
                      placeholder="Search name, phone, email, registration, fuel code…"
                      className={`${inputClass} pl-10 pr-9`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setListOpen((prev) => !prev)}
                      aria-label="Toggle results"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-textdark/50 hover:bg-grey/20"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {listOpen ? (
                    <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-grey/40 bg-white shadow-lg">
                      {matches.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-textdark/50">
                          No drivers found.
                        </p>
                      ) : (
                        <ul className="divide-y divide-grey/20">
                          {matches.map((driver) => (
                            <li key={driver.id}>
                              <button
                                type="button"
                                onClick={() => pickDriver(driver)}
                                className="w-full text-left px-4 py-3 hover:bg-offwhite"
                              >
                                <p className="font-medium text-textdark">
                                  {driver.full_name ?? "—"}
                                </p>
                                <p className="text-xs text-textdark/50 mt-0.5 flex flex-wrap gap-x-3">
                                  {driver.phone ? (
                                    <span>{driver.phone}</span>
                                  ) : null}
                                  {driver.email ? (
                                    <span>{driver.email}</span>
                                  ) : null}
                                  {driver.car_registration ? (
                                    <span>{driver.car_registration}</span>
                                  ) : null}
                                  {driver.fuel_code ? (
                                    <span>{driver.fuel_code}</span>
                                  ) : null}
                                </p>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Driver</label>
                  <div className="rounded-xl border border-grey/40 bg-offwhite p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-textdark">
                        {selected.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-textdark/50 mt-0.5 flex flex-wrap gap-x-3">
                        {selected.phone ? <span>{selected.phone}</span> : null}
                        {selected.email ? <span>{selected.email}</span> : null}
                        {selected.car_registration ? (
                          <span>{selected.car_registration}</span>
                        ) : null}
                        {selected.fuel_code ? (
                          <span>{selected.fuel_code}</span>
                        ) : null}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearDriver}
                      disabled={pending}
                      className="text-sm text-navy font-semibold hover:text-orange disabled:opacity-50"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "repair_issue", label: "Repair Purchase" },
                      { value: "repair_repayment", label: "Repair Repayment" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setType(option.value);
                        setError(null);
                      }}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                        type === option.value
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-textdark border-grey/40 hover:border-navy"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Amount (R)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className={inputClass}
                  placeholder="0.00"
                  disabled={pending || success}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Vehicle <span className="font-normal text-textdark/50">(optional)</span>
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className={inputClass}
                  disabled={pending || success}
                >
                  <option value="">None</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make_model} — {vehicle.registration}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Garage <span className="font-normal text-textdark/50">(optional)</span>
                </label>
                <select
                  value={garageId}
                  onChange={(e) => setGarageId(e.target.value)}
                  className={inputClass}
                  disabled={pending || success}
                >
                  <option value="">None</option>
                  {repairGarages.map((garage) => (
                    <option key={garage.id} value={garage.id}>
                      {garage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Date / Time <span className="font-normal text-textdark/50">(defaults to now)</span>
                </label>
                <input
                  type="datetime-local"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className={inputClass}
                  disabled={pending || success}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-grey/40">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg border border-grey/60 text-textdark font-semibold py-2.5 px-5 hover:bg-grey/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitDisabled}
                className="rounded-lg bg-orange text-white font-semibold py-2.5 px-5 hover:bg-orange/90 disabled:opacity-60"
              >
                {pending
                  ? "Saving…"
                  : success
                    ? "Logged"
                    : type === "repair_issue"
                      ? "Log Repair Purchase"
                      : "Log Repair Repayment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}