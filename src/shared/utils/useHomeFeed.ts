"use client";

import { useQuery } from "@tanstack/react-query";
import type { HomeSectionDef } from "@/features/home/utils/homeSections";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchHomeFeed } from "@/shared/utils/catalogApi";

/** The admin's home sections. `undefined` = not loaded or never saved: use the built-in feed. */
export function useHomeFeed(initial?: HomeSectionDef[] | null) {
  const q = useQuery({
    queryKey: ["home-feed"],
    enabled: hasApiBaseUrl(),
    queryFn: async () => (await fetchHomeFeed()) ?? [],
  });
  // Not `initialData`: react-query reads the clock for it, and the build refuses a clock read during prerender.
  return { ...q, data: q.data ?? initial ?? undefined };
}
