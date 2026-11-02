"use client";

import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchCatalogFeed } from "@/shared/utils/catalogApi";

export function useCatalogFeed() {
  return useQuery({
    queryKey: ["catalog-feed"],
    enabled: hasApiBaseUrl(),
    queryFn: async () => {
      const feed = await fetchCatalogFeed();
      if (!feed?.length) throw new Error("feed unavailable"); // keeps cached data on failure
      return feed;
    },
  });
}
