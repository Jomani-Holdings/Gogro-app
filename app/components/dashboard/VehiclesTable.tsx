"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Vehicle, VehicleStatus } from "@/lib/data/types";
import { CursorPagination } from "@/app/components/dashboard/CursorPagination";

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

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function VehiclesTable({
  vehicles,
  pageInfo,
  filters,
}: {
  vehicles: Vehicle[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  filters: { query: string; status: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query);

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
              {value === "all" ? "All" : statusMeta[value].label}
            </button>
          ))}
        </div>
        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicle, registration or owner…"
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
        {vehicles.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No vehicles match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Reg.</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Driver
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Owner
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 font-medium">
                    Category
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">
                    Weekly Rental
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
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
                          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/admin/vehicles/${vehicle.id}`}
                          className="inline-block text-navy font-semibold hover:text-orange"
                        >
                          View vehicle &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <CursorPagination
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
          nextCursor={pageInfo.nextCursor}
          prevCursor={pageInfo.prevCursor}
          rowCount={vehicles.length}
        />
      </div>
    </div>
  );
}
