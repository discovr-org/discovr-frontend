import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/utils/site";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

const STATIC = ["", "/about", "/how-we-pick", "/list-with-us", "/help", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = (await fetchCatalogCards()) ?? [];
  return [
    ...STATIC.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...cards.map((c) => ({ url: `${SITE_URL}/experiences/${c.slug}` })),
  ];
}
