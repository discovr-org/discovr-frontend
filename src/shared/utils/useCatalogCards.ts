"use client";

import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import type { FeedItem } from "@/features/home/utils/feedData";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

export function useCatalogCards(initialData?: FeedItem[]) {
  return useQuery({
    queryKey: ["catalog-cards"],
    enabled: hasApiBaseUrl(),
    initialData,
    queryFn: async () => {
      const cards = await fetchCatalogCards();
      if (!cards?.length) throw new Error("cards unavailable"); // keeps cached data on failure
      return cards;
    },
  });
}
