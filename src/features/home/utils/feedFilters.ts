import type { FeedItem } from "./feedData";

export const WHEN_OPTIONS = ["Anytime", "Tonight", "This weekend"] as const;
export const PRICE_OPTIONS = ["Under ₹1,000", "₹1,000 to ₹2,500", "Over ₹2,500"] as const;
export const DURATION_OPTIONS = ["Under 2 hours", "2 to 4 hours", "Over 4 hours"] as const;
export const TYPE_OPTIONS = [
  "Adventure",
  "Culture",
  "Food and drink",
  "Wildlife",
  "Nightlife",
  "Wellness",
  "Workshops",
  "Museums",
  "Water Sports",
  "Trekking",
  "Nature",
  "Art",
] as const;

export type FeedFilters = {
  areas: string[];
  when: (typeof WHEN_OPTIONS)[number] | null;
  price: (typeof PRICE_OPTIONS)[number] | null;
  duration: (typeof DURATION_OPTIONS)[number] | null;
  types: string[];
  nearMe: boolean;
};

export const NO_FILTERS: FeedFilters = {
  areas: [],
  when: null,
  price: null,
  duration: null,
  types: [],
  nearMe: false,
};

/** The short area a card shows: "Anjuna, North Goa" → "Anjuna". */
export function areaOf(item: Pick<FeedItem, "placeLabel">): string {
  return item.placeLabel.split(",")[0]?.trim() ?? item.placeLabel;
}

export function areasIn(items: FeedItem[]): string[] {
  return [...new Set(items.map(areaOf).filter(Boolean))];
}

export function activeLabels(f: FeedFilters): string[] {
  return [
    ...(f.nearMe ? ["Near me"] : []),
    ...f.areas,
    ...(f.when && f.when !== "Anytime" ? [f.when] : []),
    ...(f.price ? [f.price] : []),
    ...(f.duration ? [f.duration] : []),
    ...f.types,
  ];
}

export function hasFilters(f: FeedFilters): boolean {
  return activeLabels(f).length > 0;
}

/** Remove one active pill by its label. */
export function withoutLabel(f: FeedFilters, label: string): FeedFilters {
  return {
    areas: f.areas.filter((a) => a !== label),
    when: f.when === label ? null : f.when,
    price: f.price === label ? null : f.price,
    duration: f.duration === label ? null : f.duration,
    types: f.types.filter((t) => t !== label),
    nearMe: label === "Near me" ? false : f.nearMe,
  };
}

function inPrice(price: FeedFilters["price"], inr: number | undefined): boolean {
  if (!price) return true;
  if (inr == null) return false;
  if (price === "Under ₹1,000") return inr < 1000;
  if (price === "₹1,000 to ₹2,500") return inr >= 1000 && inr <= 2500;
  return inr > 2500;
}

function inDuration(d: FeedFilters["duration"], minutes: number | undefined): boolean {
  if (!d) return true;
  if (minutes == null) return false;
  if (d === "Under 2 hours") return minutes < 120;
  if (d === "2 to 4 hours") return minutes >= 120 && minutes <= 240;
  return minutes > 240;
}

/**
 * Area, price and duration filter on card data. When, type and near-me pass
 * everything through until the cards API carries schedule, categories and coordinates.
 */
export function applyFilters(items: FeedItem[], f: FeedFilters): FeedItem[] {
  return items.filter(
    (item) =>
      (f.areas.length === 0 || f.areas.includes(areaOf(item))) &&
      inPrice(f.price, item.priceInr) &&
      inDuration(f.duration, item.durationMinutes),
  );
}
