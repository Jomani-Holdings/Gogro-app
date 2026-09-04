"use client";

import { useEffect } from "react";
import { MapPin, X } from "lucide-react";
import type { Garage } from "@/lib/data/types";

export function GarageModal({
  garage,
  onClose,
}: {
  garage: Garage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!garage) return;

    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [garage, onClose]);

  if (!garage) return null;

  const mapQuery = garage.address
    ? encodeURIComponent(garage.address)
    : `${garage.latitude ?? 0},${garage.longitude ?? 0}`;
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-start justify-between p-6 pb-2">
          <h3 className="text-xl font-bold text-navy pr-6">{garage.name}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-textdark/60 hover:text-textdark"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {garage.address ? (
            <div className="flex items-start gap-3 mt-2">
              <MapPin size={20} className="text-orange shrink-0 mt-0.5" />
              <p className="text-textdark/80">{garage.address}</p>
            </div>
          ) : null}

          <div className="mt-5 rounded-xl overflow-hidden border border-grey/40 h-64">
            <iframe
              title={`Map showing ${garage.name}`}
              src={mapSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
