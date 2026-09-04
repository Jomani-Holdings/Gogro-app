"use client";

import { useState } from "react";
import { GarageModal } from "@/app/components/partners/GarageModal";
import type { Garage } from "@/lib/data/types";

export function GarageGrid({ garages }: { garages: Garage[] }) {
  const [selected, setSelected] = useState<Garage | null>(null);

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {garages.map((garage) => (
          <div
            key={garage.id}
            className="flex flex-col text-left bg-white border border-grey/40 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-navy">{garage.name}</h3>
            <button
              type="button"
              onClick={() => setSelected(garage)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90"
            >
              View details
            </button>
          </div>
        ))}
      </div>

      <GarageModal garage={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
