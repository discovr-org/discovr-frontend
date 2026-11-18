"use client";

import { useQuery } from "@tanstack/react-query";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchSiteSettings } from "@/shared/utils/catalogApi";
import { withDefaults, type SiteSettings } from "@/shared/utils/siteSettings";

/** The admin's words and links, with built-in text for anything not set (or while loading). */
export function useSiteSettings(initial?: Partial<SiteSettings> | null): SiteSettings {
  const q = useQuery({
    queryKey: ["site-settings"],
    enabled: hasApiBaseUrl(),
    initialData: initial ?? undefined,
    queryFn: async () => (await fetchSiteSettings()) ?? {},
  });
  return withDefaults(q.data);
}
