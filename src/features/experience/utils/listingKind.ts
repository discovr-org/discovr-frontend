import type { Experience } from "@/types/experience";

const VENUE_TAG = /bar|nightlife|restaurant|cafe|club|pub|lounge|kitchen/i;

/**
 * Bars / restaurants / venues don't use trip times or people counts.
 * Trips (kayak, tour, class) do.
 */
export function isVenueListing(experience: Experience): boolean {
  const format = experience.content?.format;
  if (format === "venue") return true;
  if (format === "trip") return false;
  if (experience.menu?.pages?.length) return true;
  if ((experience.tags ?? []).some((tag) => VENUE_TAG.test(tag))) return true;
  // Hours card (days / time slot) without a Mon–Sun trip grid → venue.
  const hours = experience.hours;
  if (hours?.days || hours?.timeSlot || hours?.bestTime) return true;
  return false;
}
