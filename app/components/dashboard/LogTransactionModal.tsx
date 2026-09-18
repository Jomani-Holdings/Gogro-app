"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { logTransaction } from "@/app/dashboard/admin/transactions/actions";
import {
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/lib/data/types";
import { formatMoney } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

export type LogTransactionDriverInfo = {
  phone: string | null;
  email: string | null;
  driver_balance: number;
  weekly_fuel_limit: number;
  weekly_fuel_issued: number;
  weekly_fuel_available: number;
  next_payment_due: string | null;
  is_overdue: boolean;
  car_make_model: string | null;
  car_registration: string | null;
  fuel_code: string | null;
  fuel_garage_name: string | null;
  fuel_garage_id: string | null;
};

export function LogTransactionModal({
  driverId,
  driverName,
  driver,
  vehicles,
  garages,
  defaultType = "fuel_issue",
  triggerLabel = "Log Transaction",
  triggerClassName,
  trigger,
}: {
  driverId: string;
  driverName: string | null;
  driver?: LogTransactionDriverInfo | null;
  vehicles: { id: string; make_model: string; registration: string }[];
  garages: { id: string; name: string }[];
  defaultType?: TransactionType;
  triggerLabel?: string;
  triggerClassName?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>("");
  const [litres, setLitres] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [garageId, setGarageId] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pendingOverride, setPendingOverride] = useState(false);

  const currentType = TRANSACTION_TYPES.find((t) => t.value === type);

  function openModal() {
    setType(defaultType);
    setAmount("");
    setLitres("");
    setVehicleId(vehicles[0]?.id ?? "");
    setGarageId(driver?.fuel_garage_id ?? "");
    setCreatedAt("");
    setError(null);
    setWarning(null);
    setPendingOverride(false);
    setOpen(true);
  }

  function submit(overrideAction?: "authorize" | "unauthorized") {
    setError(null);
    setWarning(null);
    const formData = new FormData();
    formData.append("driver_id", driverId);
    formData.append("type", type);
    formData.append("amount", amount);
    formData.append("litres", litres);
    formData.append("vehicle_id", vehicleId);
    formData.append("garage_id", garageId);
    formData.append("created_at", createdAt);
    if (overrideAction) formData.append("override_action", overrideAction);

    startTransition(async () => {
      const result = await logTransaction(formData);
      if (!result.ok) {
        if (result.requiresConfirmation && result.warning) {
          setWarning(result.warning);
          setPendingOverride(true);
          return;
        }
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setOpen(false);
      setPendingOverride(false);
      router.refresh();
    });
  }

  function formatDueDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          triggerClassName ??
          "inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold py-3 px-5 hover:bg-navy/90"
        }
      >
        {trigger ?? triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-grey/40">
              <h2 className="text-lg font-bold text-textdark">
                Log Transaction
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded-md text-textdark/60 hover:bg-grey/20"
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
              {warning ? (
                <div className="rounded-lg bg-yellow/20 border border-yellow/50 px-4 py-3 text-sm text-textdark space-y-3">
                  <p>{warning}</p>
                  {pendingOverride ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => submit("authorize")}
                        className="rounded-lg bg-navy text-white font-semibold py-2 px-4 hover:bg-navy/90 disabled:opacity-60"
                      >
                        Authorize Override
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => submit("unauthorized")}
                        className="rounded-lg border border-error text-error font-semibold py-2 px-4 hover:bg-error/10 disabled:opacity-60"
                      >
                        Process Unauthorized (+R100 penalty)
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <p className="text-sm text-textdark/70">
                Recording a transaction for{" "}
                <span className="font-semibold text-textdark">
                  {driverName ?? "this driver"}
                </span>
                .
                {type === "opening_balance"
                  ? " This is recorded for reference only and does not change the driver's balance."
                  : " Balances update automatically."}
              </p>

              {driver ? (
                <div className="rounded-xl border border-grey/40 bg-offwhite p-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">Phone</p>
                    <p className="text-textdark font-semibold">
                      {driver.phone ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">Email</p>
                    <p className="text-textdark font-semibold truncate">
                      {driver.email ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">Vehicle</p>
                    <p className="text-textdark font-semibold">
                      {driver.car_make_model ?? "—"}
                      {driver.car_registration
                        ? ` (${driver.car_registration})`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Fuel Garage
                    </p>
                    <p className="text-textdark font-semibold">
                      {driver.fuel_garage_name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Fuel Credit
                    </p>
                    <p className="text-textdark font-semibold">
                      {formatMoney(driver.weekly_fuel_limit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Fuel Code
                    </p>
                    <p className="text-textdark font-semibold">
                      {driver.fuel_code ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Driver Balance
                    </p>
                    <p className="text-textdark font-semibold">
                      {formatMoney(driver.driver_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Fuel Used This Cycle
                    </p>
                    <p className="text-textdark font-semibold">
                      {formatMoney(driver.weekly_fuel_issued)}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Fuel Credit Left
                    </p>
                    <p className="text-textdark font-semibold">
                      {formatMoney(driver.weekly_fuel_available)}
                    </p>
                  </div>
                  <div>
                    <p className="text-textdark/50 text-xs font-medium">
                      Next Payment Due
                    </p>
                    <p
                      className={`text-textdark font-semibold ${
                        driver.is_overdue ? "text-error" : ""
                      }`}
                    >
                      {formatDueDate(driver.next_payment_due)}
                      {driver.is_overdue ? " (OVERDUE)" : ""}
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="transaction_type" className={labelClass}>
                  Type
                </label>
                <select
                  id="transaction_type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className={inputClass}
                >
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="transaction_amount" className={labelClass}>
                    Amount (R)
                  </label>
                  <input
                    id="transaction_amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                {currentType?.affectsLitres ? (
                  <div>
                    <label htmlFor="transaction_litres" className={labelClass}>
                      Litres
                    </label>
                    <input
                      id="transaction_litres"
                      type="number"
                      min={0}
                      step="0.01"
                      value={litres}
                      onChange={(e) => setLitres(e.target.value)}
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label htmlFor="transaction_vehicle" className={labelClass}>
                  Vehicle <span className="font-normal text-textdark/50">(optional)</span>
                </label>
                <select
                  id="transaction_vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make_model} — {vehicle.registration}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && driver?.car_make_model ? (
                  <p className="mt-1.5 text-xs text-textdark/50">
                    No vehicle record yet. Car on profile:{" "}
                    <span className="font-medium text-textdark">
                      {driver.car_make_model}
                      {driver.car_registration
                        ? ` (${driver.car_registration})`
                        : ""}
                    </span>
                    . Saving the driver profile will create one.
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="transaction_garage" className={labelClass}>
                  Garage <span className="font-normal text-textdark/50">(optional)</span>
                </label>
                <select
                  id="transaction_garage"
                  value={garageId}
                  onChange={(e) => setGarageId(e.target.value)}
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

              <div>
                <label htmlFor="transaction_created" className={labelClass}>
                  Date / Time <span className="font-normal text-textdark/50">(defaults to now)</span>
                </label>
                <input
                  id="transaction_created"
                  type="datetime-local"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-grey/40">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-grey/60 text-textdark font-semibold py-2.5 px-5 hover:bg-grey/10"
              >
                Cancel
              </button>
              {!pendingOverride ? (
                <button
                  type="button"
                  disabled={pending || !amount}
                  onClick={() => submit()}
                  className="rounded-lg bg-orange text-white font-semibold py-2.5 px-5 hover:bg-orange/90 disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Record transaction"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}