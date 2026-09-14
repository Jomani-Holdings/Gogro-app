import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { ClientRequiredAction } from "@/lib/data/client";

const priorityStyles: Record<string, string> = {
  high: "border-orange/40 bg-orange/5",
  medium: "border-yellow/50 bg-yellow/10",
  low: "border-grey/40 bg-white",
};

export function RequiredActions({
  actions,
}: {
  actions: ClientRequiredAction[];
}) {
  if (actions.length === 0) return null;

  return (
    <section className="bg-white border border-grey/40 rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck size={20} className="text-orange" />
        <h2 className="text-lg font-semibold text-navy">Actions Required</h2>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.key}
            href={action.href}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 hover:brightness-95 transition-all ${priorityStyles[action.priority]}`}
          >
            <div>
              <p className="font-semibold text-textdark">{action.label}</p>
              <p className="text-sm text-textdark/60">{action.description}</p>
            </div>
            <span className="text-orange font-semibold shrink-0">
              Do it now &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}