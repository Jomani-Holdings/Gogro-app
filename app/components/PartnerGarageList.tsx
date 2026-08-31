"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";

interface Garage {
  id: string;
  name: string;
  location: string;
}

// DUMMY DATA — replace with a Supabase query to the `garages` table
// (filtered to `active = true` and the relevant partner type, ordered by `sort_order`).
const DUMMY_GARAGES: Record<string, Garage[]> = {
  fuel: [
    { id: "f1", name: "Strand Motors", location: "Strand" },
    { id: "f2", name: "Stellenbosch Auto", location: "Stellenbosch" },
    { id: "f3", name: "Blue Downs Filling Station", location: "Blue Downs" },
  ],
  service: [
    { id: "s1", name: "Cape Town Service Centre", location: "Cape Town" },
    { id: "s2", name: "Northern Suburbs Auto Repairs", location: "Bellville" },
  ],
};

export function PartnerGarageList({ partnertype }: { partnertype: string }) {
  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGarages(DUMMY_GARAGES[partnertype] ?? []);
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [partnertype]);

  return (
    <div className="mt-10">
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
          title="No partners yet"
          description="We're onboarding partners right now. Check back soon."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {garages.map((garage) => (
            <div
              key={garage.id}
              className="bg-white border border-grey/40 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-navy">{garage.name}</h3>
              <p className="text-textdark/60 mt-2">{garage.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
