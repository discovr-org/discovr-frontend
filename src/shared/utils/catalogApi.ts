import type { Experience } from "@/types/experience";
import { apiBaseUrl } from "@/shared/utils/apiBase";

export type ApiFeedSection = {
  id: string;
  title: string;
  density: "portrait" | "landscape";
  items: {
    slug: string;
    title: string;
    placeLabel: string;
    imageSrc: string;
    imageAlt: string;
    blurb?: string;
    durationLabel?: string;
    priceInr?: number;
    priceAsk?: boolean;
  }[];
};

export async function fetchCatalogFeed(): Promise<ApiFeedSection[] | null> {
  const base = apiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/catalog/feed`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sections: ApiFeedSection[] };
    return data.sections ?? null;
  } catch {
    return null;
  }
}

export async function fetchCatalogExperience(
  slug: string,
): Promise<Experience | null> {
  const base = apiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/v1/catalog/experiences/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Experience;
  } catch {
    return null;
  }
}
