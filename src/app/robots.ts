import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/utils/site";

// Private screens are blocked from crawling, not tagged noindex.
// AI crawlers are allowed on purpose: we want to be cited.
const PRIVATE = ["/profile", "/saved", "/search", "/ingest/", "/q/", "/~offline"];

// Named AI crawlers repeat the rules so a later edit to "*" can't block them by accident.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
