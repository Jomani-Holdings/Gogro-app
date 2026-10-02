import type { ReactNode } from "react";
import { requireClient } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireClient();
  return children;
}