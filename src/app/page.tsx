import type { Metadata } from "next";
import { ExploreFeed } from "@/features/home/components/ExploreFeed";
import { getCatalogCards } from "@/shared/utils/catalogCached";

export const metadata: Metadata = {
  title: { absolute: "discovr: things worth doing tonight" },
  alternates: { canonical: "/" },
};

export default async function Page() {
  const cards = await getCatalogCards().catch(() => undefined);
  return <ExploreFeed initialCards={cards} />;
}
