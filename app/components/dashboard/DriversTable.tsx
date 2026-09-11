"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminDriver } from "@/lib/data/admin";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow/20 text-textdark",
  active: "bg-success/10 text-success",
  suspended: "bg-error/10 text-error",
  inactive: "bg-grey/40 text-textdark",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  inactive: "Inactive",
};

const statusFilters = ["all", "pending", "active", "suspended", "inactive"] as const;

type SortKey =
  | "full_name"
  | "phone"
  | "car_make_model"
  | "credit_limit"
  | "fuel_balance"
  | "fuel_garage_name"
  | "fuel_code"
  | "driver_status"
  | "created_at";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function SortableHeader({
  label,
  column,
  sortKey,
  sortDir,
  onToggle,
  className = "",
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggle: (column: SortKey) => void;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onToggle(column)}
        className="inline-flex items-center gap-1 hover:text-navy"
      >
        {label}
        <span className="text-[10px] text-textdark/40">
          {sortKey === column ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function DriversTable({ drivers }: { drivers: AdminDriver[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "full_name" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = drivers.filter((driver) => {
      if (filter !== "all" && driver.driver_status !== filter) return false;
      if (!q) return true;
      return [
        driver.full_name,
        driver.email,
        driver.phone,
        driver.fuel_code,
        driver.car_make_model,
        driver.car_registration,
      ].some((value) => value?.toLowerCase().includes(q));
    });

    rows = [...rows].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [drivers, filter, query, sortKey, sortDir]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-textdark border-grey/40 hover:border-navy"
              }`}
            >
              {value === "all" ? "All" : statusLabels[value]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone, fuel code, car…"
          className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
        />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No drivers match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <SortableHeader
                    label="Name"
                    column="full_name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                  />
                  <SortableHeader
                    label="Phone"
                    column="phone"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden md:table-cell"
                  />
                  <SortableHeader
                    label="Car"
                    column="car_make_model"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden lg:table-cell"
                  />
                  <SortableHeader
                    label="Credit Limit"
                    column="credit_limit"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden lg:table-cell"
                  />
                  <SortableHeader
                    label="Fuel Balance"
                    column="fuel_balance"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden lg:table-cell"
                  />
                  <SortableHeader
                    label="Garage"
                    column="fuel_garage_name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden xl:table-cell"
                  />
                  <SortableHeader
                    label="Fuel Code"
                    column="fuel_code"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden md:table-cell"
                  />
                  <SortableHeader
                    label="Status"
                    column="driver_status"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                  />
                  <SortableHeader
                    label="Created"
                    column="created_at"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden sm:table-cell"
                  />
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-textdark">
                        {driver.full_name ?? "—"}
                      </p>
                      <p className="text-textdark/50 md:hidden">{driver.phone}</p>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                      {driver.phone ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                      {driver.car_make_model ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                      {formatMoney(driver.credit_limit)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                      {formatMoney(driver.fuel_balance)}
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3 text-textdark/80">
                      {driver.fuel_garage_name ?? "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                      {driver.fuel_code ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[driver.driver_status] ?? statusStyles.pending
                        }`}
                      >
                        {statusLabels[driver.driver_status] ?? "Pending"}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-textdark/60">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/drivers/${driver.id}`}
                        className="inline-block text-navy font-semibold hover:text-orange"
                      >
                        Open &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}