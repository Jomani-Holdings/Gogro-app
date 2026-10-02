"use client";

import { useEffect, useState } from "react";

export function ClientHeaderClock() {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    function format(d: Date): string {
      const weekday = d.toLocaleString("en-GB", { weekday: "long" });
      const month = d.toLocaleString("en-GB", { month: "long" });
      const day = d.getDate();
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${weekday}, ${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
    }

    function update() {
      setLabel(format(new Date()));
    }

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-sm font-medium text-white/90 tabular-nums">
      {label || "\u00A0"}
    </span>
  );
}