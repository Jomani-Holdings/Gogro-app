import type { ReactNode } from "react";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <div className="max-w-3xl mx-auto w-full">{children}</div>;
}
