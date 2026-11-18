import type { Metadata } from "next";
import { ExploreFeed } from "@/features/home/components/ExploreFeed";
import { fetchHomeFeed, fetchSiteSettings } from "@/shared/utils/catalogApi";
import { getCatalogCards } from "@/shared/utils/catalogCached";

export const metadata: Metadata = {
  title: { absolute: "discovr: things worth doing tonight" },
  alternates: { canonical: "/" },
};

export default async function Page() {
  const [cards, sections, settings] = await Promise.all([
    getCatalogCards().catch(() => undefined),
    fetchHomeFeed().catch(() => null),
    fetchSiteSettings().catch(() => null),
  ]);
  return <ExploreFeed initialCards={cards} initialSections={sections} initialSettings={settings} />;
}
