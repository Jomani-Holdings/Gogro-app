import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No data available",
  description = "There's nothing to show here right now. Check back soon.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6">
      <div className="bg-grey/30 rounded-full p-4 text-textdark/50">
        <Inbox size={32} />
      </div>
      <h3 className="text-xl font-semibold text-textdark">{title}</h3>
      <p className="text-textdark/60 max-w-sm">{description}</p>
    </div>
  );
}
