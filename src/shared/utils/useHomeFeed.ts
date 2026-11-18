"use client";

import { useQuery } from "@tanstack/react-query";
import type { HomeSectionDef } from "@/features/home/utils/homeSections";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchHomeFeed } from "@/shared/utils/catalogApi";

/** The admin's home sections. `undefined` = not loaded or never saved: use the built-in feed. */
export function useHomeFeed(initial?: HomeSectionDef[] | null) {
  return useQuery({
    queryKey: ["home-feed"],
    enabled: hasApiBaseUrl(),
    initialData: initial ?? undefined,
    queryFn: async () => (await fetchHomeFeed()) ?? [],
  });
}
