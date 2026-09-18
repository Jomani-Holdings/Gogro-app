"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { FuelUsageByGarage } from "@/lib/data/types";

const COLORS = [
  "#0c0275",
  "#fb6d00",
  "#fbb000",
  "#1e8e5a",
  "#d93025",
  "#5b5bd6",
  "#7d8597",
  "#c4a5e6",
];

export function FuelUsageByGarage({
  data,
}: {
  data: FuelUsageByGarage[];
}) {
  const totalLitres = data.reduce((sum, d) => sum + d.litres, 0);
  const chartData = data.map((d, i) => ({
    name: d.garage_name ?? "Unassigned",
    value: d.litres,
    color: COLORS[i % COLORS.length],
    amount: d.amount,
  }));

  return (
    <div className="bg-white border border-grey/40 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-navy mb-4">
        Fuel Usage by Garage
      </h2>

      {data.length === 0 || totalLitres === 0 ? (
        <div className="flex items-center justify-center h-48 text-textdark/50 text-sm">
          No fuel issued this cycle yet.
        </div>
      ) : (
        <>
          <p className="text-sm text-textdark/60 mb-3">
            Fuel issued during the current Tue–Mon cycle.
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const num = typeof value === "number" ? value : Number(value ?? 0);
                      return [`${num.toFixed(1)} L`, String(name)];
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e3e3ee",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-textdark/60">
              Total: <span className="font-semibold">{totalLitres.toFixed(1)} L</span>
            </p>
          </div>

          <div className="mt-5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey/40 text-left text-textdark/60">
                  <th className="px-2 py-2 font-medium">Garage</th>
                  <th className="px-2 py-2 font-medium text-right">Litres</th>
                  <th className="px-2 py-2 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr
                    key={d.garage_id ?? "unassigned"}
                    className="border-b border-grey/20 last:border-0"
                  >
                    <td className="px-2 py-2 text-textdark flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                      {d.garage_name ?? "Unassigned"}
                    </td>
                    <td className="px-2 py-2 text-right text-textdark/80">
                      {d.litres.toFixed(1)} L
                    </td>
                    <td className="px-2 py-2 text-right text-textdark/80">
                      R{d.amount.toLocaleString("en-ZA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}