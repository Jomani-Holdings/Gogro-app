"use client";

import { useState, useTransition } from "react";
import { setDriverSuspended } from "@/app/dashboard/admin/actions";
import type { AdminDriver } from "@/lib/data/admin";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DriversTable({ drivers }: { drivers: AdminDriver[] }) {
  const [pending, startTransition] = useTransition();
  const [list, setList] = useState(drivers);

  function toggle(driver: AdminDriver) {
    startTransition(async () => {
      const result = await setDriverSuspended(driver.id, !driver.suspended);
      if (result.ok) {
        setList((current) =>
          current.map((item) =>
            item.id === driver.id
              ? { ...item, suspended: !item.suspended }
              : item
          )
        );
      }
    });
  }

  return (
    <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      {list.length === 0 ? (
        <div className="p-10 text-center text-textdark/60">
          No drivers yet.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey/40 text-left text-textdark/60">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">
                Email
              </th>
              <th className="hidden sm:table-cell px-4 py-3 font-medium">
                Phone
              </th>
              <th className="hidden lg:table-cell px-4 py-3 font-medium">
                Joined
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((driver) => (
              <tr
                key={driver.id}
                className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
              >
                <td className="px-4 py-3 font-medium text-textdark">
                  {driver.full_name ?? "—"}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                  {driver.email ?? "—"}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-textdark/80">
                  {driver.phone ?? "—"}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-textdark/60">
                  {formatDate(driver.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      driver.suspended
                        ? "bg-error/10 text-error"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {driver.suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(driver)}
                    className={`inline-block rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      driver.suspended
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "bg-error/10 text-error hover:bg-error/20"
                    }`}
                  >
                    {driver.suspended ? "Activate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
