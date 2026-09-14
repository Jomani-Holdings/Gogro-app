import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = "navy",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  accent?: "navy" | "orange" | "success" | "error" | "yellow";
}) {
  const iconColor: Record<string, string> = {
    navy: "bg-navy/10 text-navy",
    orange: "bg-orange/10 text-orange",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    yellow: "bg-yellow/20 text-textdark",
  };

  return (
    <div className="bg-white border border-grey/40 rounded-2xl p-5 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-textdark/60 leading-snug">
          {label}
        </p>
        <span
          className={`inline-flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${iconColor[accent]}`}
        >
          <Icon size={20} />
        </span>
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-textdark leading-tight">
          {value}
        </p>
        {sub ? (
          <p className="text-xs text-textdark/50 mt-1">{sub}</p>
        ) : null}
      </div>
    </div>
  );
}