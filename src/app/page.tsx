import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { ExploreFeed } from "@/features/home/components/ExploreFeed";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

export const metadata: Metadata = {
  title: { absolute: "discovr: things worth doing tonight" },
  alternates: { canonical: "/" },
};

// Cached, so the listings are baked into the page HTML that crawlers fetch.
// Throws on failure so an empty result is never cached.
async function getCards() {
  "use cache";
  cacheLife("minutes");
  const cards = await fetchCatalogCards();
  if (!cards) throw new Error("catalog cards unavailable");
  return cards;
}

export default async function Page() {
  const cards = await getCards().catch(() => undefined);
  return <ExploreFeed initialCards={cards} />;
}
