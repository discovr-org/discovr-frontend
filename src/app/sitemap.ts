import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/utils/site";
import { buildHubs } from "@/features/hubs/utils/hubs";
import { sectionsOf } from "@/features/home/utils/homeSections";
import { fetchCatalogCards, fetchHomeFeed } from "@/shared/utils/catalogApi";

const STATIC = ["", "/goa-for-you", "/about", "/how-we-pick", "/list-with-us", "/help", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = (await fetchCatalogCards()) ?? [];
  return [
    ...STATIC.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...buildHubs(cards, sectionsOf(await fetchHomeFeed())).map((h) => ({ url: `${SITE_URL}/goa/${h.slug}` })),
    ...cards.map((c) => ({ url: `${SITE_URL}/experiences/${c.slug}` })),
  ];
}
