"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";

interface Garage {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

// DUMMY DATA — replace with a Supabase query to the `garages` table
// (filtered to `active = true`, ordered by `sort_order`) when the backend is wired.
const DUMMY_GARAGES: Garage[] = [
  { id: "1", name: "Strand Motors", location: "Strand", active: true },
  { id: "2", name: "Stellenbosch Auto", location: "Stellenbosch", active: true },
  { id: "3", name: "Blue Downs Filling Station", location: "Blue Downs", active: true },
];

export function PartnerGarageGrid() {
  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGarages(DUMMY_GARAGES);
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-textdark">
        Our Partner Garages
      </h3>
      <p className="text-textdark/60 mt-2">
        Fuel credit is available at these active partner garages.
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
              className="bg-white border border-grey/40 rounded-xl p-6"
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
              <p className="text-textdark/60 mt-2">{garage.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
