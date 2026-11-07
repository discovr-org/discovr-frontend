import type { NextConfig } from "next";
import { tshirtQrDestination } from "./src/shared/analytics/utils/qrCampaign";

const tshirtQr = tshirtQrDestination();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "imagedelivery.net", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "media.discovr.in", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discovr.in", pathname: "/**" },
    ],
  },
  experimental: {
    useCache: true,
  },
  // PostHog goes through our own domain so ad blockers don't drop events.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  async redirects() {
    return [
      // www -> non-www, keeps the path. Also set this in your host's domain settings.
      { source: "/:path*", has: [{ type: "host", value: "www.discovr.in" }], destination: "https://discovr.in/:path*", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      // T-shirt QR. Temporary so we can change where it lands without reprinting.
      { source: "/q/t", destination: tshirtQr, permanent: false },
      { source: "/q/t/", destination: tshirtQr, permanent: false },
    ];
  },
};

export default nextConfig;
