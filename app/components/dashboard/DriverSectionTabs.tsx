"use client";

import { useState } from "react";
import Link from "next/link";
import { DriversTable } from "@/app/components/dashboard/DriversTable";
import { RepairDriversTable } from "@/app/components/dashboard/RepairDriversTable";
import { LogRepairModal } from "@/app/components/dashboard/LogRepairModal";
import type {
  AdminDriver,
  AdminDriverSearchOption,
  AdminRepairDriver,
} from "@/lib/data/admin";
import type { Vehicle } from "@/lib/data/types";

type Tab = "drivers" | "repairs";

export function DriverSectionTabs({
  drivers,
  garages,
  repairDrivers,
  searchDrivers,
  vehicles,
}: {
  drivers: AdminDriver[];
  garages: { id: string; name: string }[];
  repairDrivers: AdminRepairDriver[];
  searchDrivers: AdminDriverSearchOption[];
  vehicles: Vehicle[];
}) {
  const [tab, setTab] = useState<Tab>("drivers");

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-navy text-white border-navy"
        : "bg-white text-textdark border-grey/40 hover:border-navy"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("drivers")}
          className={tabClass(tab === "drivers")}
        >
          Drivers
        </button>
        <button
          type="button"
          onClick={() => setTab("repairs")}
          className={tabClass(tab === "repairs")}
        >
          Repairs
        </button>
      </div>

      {tab === "drivers" ? (
        <div>
          <div className="flex justify-end mb-6">
            <Link
              href="/dashboard/admin/drivers/new"
              className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
            >
              Add Driver
            </Link>
          </div>
          <DriversTable drivers={drivers} garages={garages} />
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-6">
            <LogRepairModal
              drivers={searchDrivers}
              vehicles={vehicles}
              garages={garages}
            />
          </div>
          <RepairDriversTable drivers={repairDrivers} />
        </div>
      )}
    </div>
  );
}