"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminDriver } from "@/lib/data/admin";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";

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

const statusFilters = [
  "all",
  "pending",
  "active",
  "suspended",
  "inactive",
] as const;

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

export function DriversTable({
  drivers,
  garages,
  pageInfo,
  filters,
}: {
  drivers: AdminDriver[];
  garages: { id: string; name: string }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  filters: {
    query: string;
    status: string;
    garage: string;
    suspended: boolean;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query);
  const [garage, setGarage] = useState(filters.garage);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("cursor");
    params.delete("dir");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: FormEvent) {
    e.preventDefault();
    navigate({ q: query.trim() || null });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                navigate({ status: value === "all" ? null : value })
              }
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters.status === value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-textdark border-grey/40 hover:border-navy"
              }`}
            >
              {value === "all" ? "All" : statusLabels[value]}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              navigate({ suspended: filters.suspended ? null : "1" })
            }
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filters.suspended
                ? "bg-error text-white border-error"
                : "bg-white text-textdark border-grey/40 hover:border-error"
            }`}
          >
            Suspended only
          </button>
          <select
            value={garage}
            onChange={(e) => {
              setGarage(e.target.value);
              navigate({
                garage: e.target.value === "all" ? null : e.target.value,
              });
            }}
            className="px-4 py-2 rounded-full text-sm font-medium border border-grey/40 bg-white text-textdark focus:outline-none focus:ring-2 focus:ring-orange/60"
          >
            <option value="all">All garages</option>
            {garages.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, fuel code…"
            className="w-full md:w-72 rounded-lg border border-grey/60 bg-white px-4 py-2.5 text-sm text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
        {drivers.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No drivers match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Phone
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Car
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Fuel Credit
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Fuel Balance
                  </th>
                  <th className="hidden xl:table-cell px-4 py-3 font-medium">
                    Garage
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Fuel Code
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-medium">
                    Created
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-textdark">
                        {driver.full_name ?? "—"}
                      </p>
                      <p className="text-textdark/50 md:hidden">
                        {driver.phone}
                      </p>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                      {driver.phone ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                      {driver.car_make_model ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-textdark/80">
                      {formatMoney(driver.weekly_fuel_limit)}
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
                          statusStyles[driver.driver_status] ??
                          statusStyles.pending
                        }`}
                      >
                        {statusLabels[driver.driver_status] ?? "Pending"}
                      </span>
                      {driver.suspended &&
                      driver.driver_status !== "suspended" ? (
                        <span className="inline-block ml-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-error/10 text-error">
                          Suspended
                        </span>
                      ) : null}
                      {driver.is_overdue ? (
                        <span className="inline-block ml-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-error text-white">
                          OVERDUE
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-textdark/60">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/drivers/${driver.id}`}
                        className="inline-block text-navy font-semibold hover:text-orange"
                      >
                        View profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <CursorPagination
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
          nextCursor={pageInfo.nextCursor}
          prevCursor={pageInfo.prevCursor}
          rowCount={drivers.length}
        />
      </div>
    </div>
  );
}
