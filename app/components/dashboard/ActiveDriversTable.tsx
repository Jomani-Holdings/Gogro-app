import Link from "next/link";
import { formatMoney, formatDate } from "@/lib/utils";
import type { DashboardActiveDriver } from "@/lib/data/types";

export function ActiveDriversTable({
  drivers,
}: {
  drivers: DashboardActiveDriver[];
}) {
  return (
    <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      {drivers.length === 0 ? (
        <div className="p-10 text-center text-textdark/60">
          No active drivers right now.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Vehicle
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 font-medium">
                  Fuel Credit
                </th>
                <th className="px-4 py-3 font-medium">
                  Fuel Used (This Month)
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
                      {driver.vehicle?.make_model ?? "—"}
                    </p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/80">
                    {driver.vehicle
                      ? `${driver.vehicle.make_model} (${driver.vehicle.registration})`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-success/10 text-success px-2.5 py-1 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      Active
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-textdark/80">
                    {formatMoney(driver.fuel_balance)}
                  </td>
                  <td className="px-4 py-3 text-textdark/80">
                    {driver.fuel_used_this_month > 0
                      ? `${driver.fuel_used_this_month.toFixed(1)} L`
                      : "0 L"}
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
      {drivers.length > 0 ? (
        <div className="px-4 py-3 border-t border-grey/20 text-xs text-textdark/50">
          Updated {formatDate(new Date().toISOString())}
        </div>
      ) : null}
    </div>
  );
}