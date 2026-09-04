import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { MarketingShell } from "@/app/components/MarketingShell";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
  description:
    "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <MarketingShell>{children}</MarketingShell>
      </body>
    </html>
  );
}
