"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";
import { GarageModal } from "@/app/components/partners/GarageModal";
import { fetchGarages, type Garage } from "@/app/components/partners/garages";

export function PartnerGarageGrid() {
  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selected, setSelected] = useState<Garage | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchGarages("fuel").then((data) => {
      if (mounted) {
        setGarages(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-textdark">
        Our Partner Garages
      </h3>
      <p className="text-textdark/60 mt-2">
        Fuel credit is available at these active partner garages. Tap a garage
        to view its address and location.
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-grey/40 rounded-xl p-6"
            >
              <Skeleton variant="text" className="h-5 w-2/3 mb-4" />
              <Skeleton variant="text" className="h-4 w-1/3 mb-2" />
              <Skeleton variant="text" className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : garages.length === 0 ? (
        <EmptyState
          title="No partner garages yet"
          description="We're onboarding garages right now. Check back soon."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {garages.map((garage) => (
            <div
              key={garage.id}
              className="flex flex-col text-left bg-white border border-grey/40 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-semibold text-navy">
                  {garage.name}
                </h4>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 rounded-full px-2.5 py-1 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Active
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-textdark/60 mt-2">
                <MapPin size={16} className="text-orange shrink-0" />
                {garage.address ?? "Location available on request"}
              </p>
              <button
                type="button"
                onClick={() => setSelected(garage)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-5 transition-colors hover:bg-orange/90"
              >
                View details &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      <GarageModal garage={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
