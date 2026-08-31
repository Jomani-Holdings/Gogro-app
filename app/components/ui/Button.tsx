import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/60";

const variants = {
  primary: "bg-orange text-white border border-transparent hover:bg-transparent hover:border-white",
  secondary: "bg-navy text-white hover:bg-navy-dark",
  outline: "border border-navy text-navy hover:bg-navy/5",
  whiteOutline: "bg-transparent border border-white text-white hover:bg-orange hover:border-transparent",
} as const;

type ButtonProps = {
  href: string;
  variant?: keyof typeof variants;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  href,
  variant = "primary",
  external = false,
  className = "",
  children,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
