"use client";

import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchCatalogCards } from "@/shared/utils/catalogApi";

export function useCatalogCards() {
  return useQuery({
    queryKey: ["catalog-cards"],
    enabled: hasApiBaseUrl(),
    queryFn: async () => {
      const cards = await fetchCatalogCards();
      if (!cards?.length) throw new Error("cards unavailable"); // keeps cached data on failure
      return cards;
    },
  });
}
