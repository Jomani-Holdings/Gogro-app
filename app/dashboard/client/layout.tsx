import type { ReactNode } from "react";
import { requireClient } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireClient();
  return <div className="max-w-3xl mx-auto w-full">{children}</div>;
}