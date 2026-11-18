import { cacheLife } from "next/cache";
import { sectionsOf } from "@/features/home/utils/homeSections";
import { fetchCatalogCards, fetchHomeFeed } from "@/shared/utils/catalogApi";

/**
 * Every live card, cached so server pages bake listings into their HTML.
 * Throws on failure so an empty result is never cached. Callers catch.
 */
export async function getCatalogCards() {
  "use cache";
  cacheLife("minutes");
  const cards = await fetchCatalogCards();
  if (!cards) throw new Error("catalog cards unavailable");
  return cards;
}

/** The home sections (admin's, else built-in), cached. Hub pages are built from them. Never throws. */
export async function getHomeSections() {
  "use cache";
  cacheLife("minutes");
  return sectionsOf(await fetchHomeFeed().catch(() => null));
}
