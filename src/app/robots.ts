import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/utils/site";

// Private screens are blocked from crawling, not tagged noindex.
// AI crawlers are allowed on purpose: we want to be cited.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/profile", "/saved", "/search", "/ingest/", "/q/", "/~offline"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
