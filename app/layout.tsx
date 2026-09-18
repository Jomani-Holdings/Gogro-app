import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { SerwistProvider } from "@serwist/turbopack/react";
import { MarketingShell } from "@/app/components/MarketingShell";
import { JsonLd } from "@/app/components/JsonLd";
import { SITE_URL } from "@/lib/data/seo";

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
  metadataBase: new URL(SITE_URL),
  applicationName: "Go Gro Mobility",
  title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
  description:
    "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Go Gro Mobility",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Go Gro Mobility",
    title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
    description:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Gro Mobility | Mobility Solutions That Move You Forward",
    description:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0275",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Go Gro Mobility",
            url: SITE_URL,
            logo: `${SITE_URL}/images/logo/GoGro-logo.svg`,
            email: "info@gogromobility.co.za",
            description:
              "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
            foundingDate: "2025",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "info@gogromobility.co.za",
            },
            sameAs: [
              "https://web.facebook.com/profile.php?id=61590311141014",
            ],
          }}
        />
        <SerwistProvider swUrl="/serwist/sw.js">
          <MarketingShell>{children}</MarketingShell>
        </SerwistProvider>
      </body>
    </html>
  );
}
