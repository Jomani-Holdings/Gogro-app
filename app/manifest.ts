import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go Gro Mobility",
    short_name: "Go Gro",
    description:
      "Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7fa",
    theme_color: "#0c0275",
    orientation: "portrait",
    categories: ["business", "finance", "transportation"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}