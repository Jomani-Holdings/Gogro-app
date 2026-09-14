"use client";

import { useState } from "react";
import Image from "next/image";
import { Fuel, Wrench } from "lucide-react";
import { GarageModal } from "@/app/components/partners/GarageModal";
import { mediaUrl } from "@/lib/media";
import type { Garage } from "@/lib/data/types";

export function GarageGrid({
  garages,
  partnerTypeSlug,
}: {
  garages: Garage[];
  partnerTypeSlug?: string;
}) {
  const [selected, setSelected] = useState<Garage | null>(null);

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {garages.map((garage) => {
          const hasImage = Boolean(garage.image_path);
          return (
            <div
              key={garage.id}
              className="flex flex-col text-left bg-white border border-grey/40 rounded-xl overflow-hidden"
            >
              <div className="relative aspect-video bg-offwhite">
                {hasImage ? (
                  <Image
                    src={mediaUrl(garage.image_path!)}
                    alt={`${garage.name} image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-offwhite text-textdark/40">
                    {partnerTypeSlug === "service" ? (
                      <Wrench size={40} strokeWidth={1.5} />
                    ) : (
                      <Fuel size={40} strokeWidth={1.5} />
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg font-semibold text-navy">{garage.name}</h3>
                <button
                  type="button"
                  onClick={() => setSelected(garage)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90"
                >
                  View details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <GarageModal garage={selected} onClose={() => setSelected(null)} />
    </div>
  );
}