"use client";

import { useState } from "react";
import { Crosshair } from "lucide-react";
import type { Garage } from "@/lib/data/types";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type LocatedGarage = Garage & { distanceKm: number | null };

function GarageCard({ garage }: { garage: LocatedGarage }) {
  const mapSrc = `https://maps.google.com/maps?q=${
    garage.latitude && garage.longitude
      ? `${garage.latitude},${garage.longitude}`
      : encodeURIComponent(garage.address ?? "")
  }&z=15&output=embed`;

  return (
    <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden">
      <iframe
        title={`Map showing ${garage.name}`}
        src={mapSrc}
        className="w-full h-44"
        loading="lazy"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-textdark">{garage.name}</h4>
          {garage.distanceKm !== null && (
            <span className="text-xs font-semibold text-orange shrink-0">
              {garage.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
        <p className="text-sm text-textdark/60 mt-1">
          {garage.address ?? ""}
        </p>
        {garage.phone && (
          <a
            href={`tel:${garage.phone.replace(/\s/g, "")}`}
            className="text-sm text-navy font-medium hover:text-orange mt-2 inline-block"
          >
            {garage.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export function GarageLocator({ garages }: { garages: Garage[] }) {
  const [located, setLocated] = useState<LocatedGarage[]>(
    garages.map((garage) => ({ ...garage, distanceKm: null }))
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported on this device.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocated(
          garages.map((garage) => ({
            ...garage,
            distanceKm:
              garage.latitude && garage.longitude
                ? haversineDistance(
                    latitude,
                    longitude,
                    garage.latitude,
                    garage.longitude
                  )
                : null,
          })).sort((a, b) => {
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
          })
        );
        setLocating(false);
      },
      () => {
        setError("We couldn't get your location. Showing all garages.");
        setLocating(false);
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-textdark/70">
          Tap a garage to see it on the map.
        </p>
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-lg bg-navy text-white font-semibold py-2.5 px-4 hover:bg-navy-dark disabled:opacity-60"
        >
          <Crosshair size={16} />
          {locating ? "Locating…" : "Show nearest"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-error mb-4">{error}</p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {located.map((garage) => (
          <GarageCard key={garage.id} garage={garage} />
        ))}
      </div>
    </div>
  );
}
