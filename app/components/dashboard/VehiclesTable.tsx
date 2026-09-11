"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Vehicle, VehicleStatus } from "@/lib/data/types";

const statusMeta: Record<
  VehicleStatus,
  { label: string; dot: string; badge: string }
> = {
  active: {
    label: "Active",
    dot: "bg-success",
    badge: "bg-success/10 text-success",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-yellow",
    badge: "bg-yellow/20 text-textdark",
  },
  off_road: {
    label: "Off-Road",
    dot: "bg-error",
    badge: "bg-error/10 text-error",
  },
};

const statusFilters = ["all", "active", "maintenance", "off_road"] as const;

type SortKey =
  | "make_model"
  | "registration"
  | "driver_name"
  | "owner_name"
  | "category"
  | "weekly_rental"
  | "status";

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

export function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("make_model");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "make_model" ? "asc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = vehicles.filter((vehicle) => {
      if (filter !== "all" && vehicle.status !== filter) return false;
      if (!q) return true;
      return [vehicle.make_model, vehicle.registration].some((value) =>
        value?.toLowerCase().includes(q)
      );
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
  }, [vehicles, filter, query, sortKey, sortDir]);

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
              {value === "all" ? "All" : statusMeta[value].label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vehicle or registration…"
          className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
        />
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No vehicles match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <SortableHeader
                    label="Vehicle"
                    column="make_model"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                  />
                  <SortableHeader
                    label="Reg."
                    column="registration"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                  />
                  <SortableHeader
                    label="Driver"
                    column="driver_name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden md:table-cell"
                  />
                  <SortableHeader
                    label="Owner"
                    column="owner_name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden lg:table-cell"
                  />
                  <SortableHeader
                    label="Category"
                    column="category"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden lg:table-cell"
                  />
                  <SortableHeader
                    label="Weekly Rental"
                    column="weekly_rental"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                    className="hidden md:table-cell"
                  />
                  <SortableHeader
                    label="Status"
                    column="status"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggle={toggleSort}
                  />
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => {
                  const meta = statusMeta[vehicle.status];
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-textdark">
                          {vehicle.make_model}
                        </p>
                        <p className="text-textdark/50 md:hidden">
                          {vehicle.registration}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-textdark/80">
                        {vehicle.registration}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                        {vehicle.driver_name ?? "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                        {vehicle.owner_name ?? "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                        {vehicle.category ?? "—"}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                        {formatMoney(vehicle.weekly_rental)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${meta.dot}`}
                          />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/admin/vehicles/${vehicle.id}`}
                          className="inline-block text-navy font-semibold hover:text-orange"
                        >
                          Open &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}