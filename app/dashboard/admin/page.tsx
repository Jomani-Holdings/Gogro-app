import { Users, Fuel, Wallet, Percent, Wrench, ShieldAlert, Car, Truck } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getAdminDashboardStats,
  getAdminActiveDriversForDashboard,
  getFuelUsageByGarage,
  getTopDebtors,
} from "@/lib/data/admin";
import { formatMoney } from "@/lib/utils";
import { KpiCard } from "@/app/components/dashboard/KpiCard";
import { ActiveDriversTable } from "@/app/components/dashboard/ActiveDriversTable";
import { DebtBalanceOverview } from "@/app/components/dashboard/DebtBalanceOverview";

const FuelUsageByGarage = dynamic(() =>
  import("@/app/components/dashboard/FuelUsageByGarage").then(
    (m) => m.FuelUsageByGarage
  )
);

export default async function AdminOverviewPage() {
  const [stats, activeDrivers, fuelUsage, topDebtors] = await Promise.all([
    getAdminDashboardStats(),
    getAdminActiveDriversForDashboard(),
    getFuelUsageByGarage(),
    getTopDebtors(5),
  ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">Overview</h1>
      <p className="text-textdark/60 mt-1">
        A snapshot of your fleet, fuel credit and repayments.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <KpiCard
          label="Active Drivers"
          value={String(stats.activeDrivers)}
          icon={Users}
          accent="navy"
        />
        <KpiCard
          label="Fuel Issued This Week"
          value={formatMoney(stats.fuelIssuedThisWeek.amount)}
          icon={Fuel}
          sub={`${stats.fuelIssuedThisWeek.litres.toFixed(1)} L issued`}
          accent="orange"
        />
        <KpiCard
          label="Outstanding Fuel Credit"
          value={formatMoney(stats.outstandingFuelCredit)}
          icon={Wallet}
          accent="success"
        />
        <KpiCard
          label="Repayment Rate"
          value={`${stats.repaymentRate}%`}
          icon={Percent}
          accent="success"
        />
        <KpiCard
          label="Active Repair Benefits"
          value={String(stats.activeRepairBenefits)}
          icon={Wrench}
          accent="yellow"
        />
        <KpiCard
          label="Repair Credit Outstanding"
          value={formatMoney(stats.repairCreditOutstanding)}
          icon={ShieldAlert}
          accent="error"
        />
        <KpiCard
          label="Vehicles Under Management"
          value={String(stats.vehiclesUnderManagement)}
          icon={Car}
          accent="navy"
        />
        <KpiCard
          label="Rental Vehicles"
          value={String(stats.rentalVehicles)}
          icon={Truck}
          accent="orange"
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-textdark">Active Drivers</h2>
          <Link
            href="/dashboard/admin/drivers"
            className="text-sm text-navy font-semibold hover:text-orange"
          >
            View all &rarr;
          </Link>
        </div>
        <ActiveDriversTable drivers={activeDrivers} />
      </section>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <FuelUsageByGarage data={fuelUsage} />
        <DebtBalanceOverview debtors={topDebtors} />
      </div>
    </div>
  );
}