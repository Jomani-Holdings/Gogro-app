interface SkeletonProps {
  variant?: "text" | "card" | "circle";
  className?: string;
}

export function Skeleton({ variant = "text", className = "" }: SkeletonProps) {
  const base = "animate-pulse bg-grey/30 rounded";

  if (variant === "circle") {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  if (variant === "card") {
    return <div className={`${base} rounded-lg ${className}`} />;
  }

  return <div className={`${base} h-4 w-full ${className}`} />;
}
