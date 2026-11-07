import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreFeed } from "@/features/home/components/ExploreFeed";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

export const metadata: Metadata = {
  title: { absolute: "discovr: things worth doing tonight" },
  alternates: { canonical: "/" },
};

async function Feed() {
  const cards = await fetchCatalogCards();
  return <ExploreFeed initialCards={cards ?? undefined} />;
}

export default function Page() {
  return (
    <Suspense fallback={<ExploreFeed />}>
      <Feed />
    </Suspense>
  );
}
