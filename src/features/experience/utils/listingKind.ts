import type { Experience } from "@/types/experience";

const VENUE_TAG =
  /bar|nightlife|restaurant|cafe|club|pub|lounge|kitchen|cocktail|dining|cuisine|rooftop|shack|thali|seafood/i;

/**
 * Bars / restaurants / venues don't use trip times or people counts.
 * Trips (kayak, tour, class) do.
 */
export function isVenueListing(experience: Experience): boolean {
  const format = experience.content?.format;
  if (format === "venue") return true;
  if (format === "trip") return false;
  if (experience.menu?.pages?.length) return true;
  return (experience.tags ?? []).some((tag) => VENUE_TAG.test(tag));
}
