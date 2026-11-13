import { color } from "@/shared/styles/tokens";

/**
 * The install file. With ?h=<code> the installed app opens at /?h=<code>, which is how a signed-in
 * browser hands its login to an iOS Home Screen app (which starts with empty storage).
 * Never cached: every code is different.
 */
export function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("h");
  const startUrl = code && /^[A-Za-z0-9_-]{20,100}$/.test(code) ? `/?h=${code}` : "/";
  const manifest = {
    name: "discovr",
    short_name: "discovr",
    description: "Eight things worth doing tonight, not eight hundred. We've been to all of them.",
    start_url: startUrl,
    display: "standalone",
    orientation: "portrait",
    background_color: color.surfaceCanvas,
    theme_color: color.surfaceCanvas,
    icons: [
      { src: "/icons/discovr-app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/discovr-app-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/discovr-app-icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "no-store" },
  });
}
