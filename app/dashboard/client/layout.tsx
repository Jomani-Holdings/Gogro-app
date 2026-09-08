import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <div className="max-w-3xl mx-auto w-full">{children}</div>;
}