import { cacheLife } from "next/cache";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

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
