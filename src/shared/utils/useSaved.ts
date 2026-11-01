"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readSavedSlugs,
  toggleSavedSlug,
} from "@/shared/utils/savedStore";

export function useSaved() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSavedSlugs());
  }, []);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback((slug: string) => {
    setSlugs(toggleSavedSlug(slug));
  }, []);

  return { slugs, isSaved, toggle, hasAny: slugs.length > 0 };
}
