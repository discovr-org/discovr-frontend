import type { MetadataRoute } from "next";
import { color } from "@/shared/styles/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "discovr",
    short_name: "discovr",
    description:
      "Eight things worth doing tonight, not eight hundred. We've been to all of them.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: color.surfaceCanvas,
    theme_color: color.surfaceCanvas,
    icons: [
      {
        src: "/icons/discovr-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/discovr-app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/discovr-app-icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
