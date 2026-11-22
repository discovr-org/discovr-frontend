import { formatPrice } from "@/shared/utils/formatPrice";

export type FeedItem = {
  slug: string;
  title: string;
  placeLabel: string;
  imageSrc: string;
  imageAlt: string;
  blurb?: string;
  /** Extra words from the listing's search vector. Search only; never shown. */
  searchWords?: string;
  durationLabel?: string;
  durationMinutes?: number;
  priceInr?: number;
  /** e.g. "+ taxes" */
  priceSuffix?: string;
  /** venue = bar or restaurant (cards show no price); trip = everything else. */
  format?: "trip" | "venue";
  /** The category (page layout) the listing is in, set in the admin. Feeds the Type filter. */
  categoryName?: string;
  categorySlug?: string;
  /** The category's weight (1 to 1000). Higher puts its row higher on the home page. */
  categoryWeight?: number;
};

/** rail: tall cards you swipe sideways. stack: one big card each. */
export type SectionLayout = "rail" | "stack";

export type FeedSection = {
  id: string;
  title: string;
  layout: SectionLayout;
  items: FeedItem[];
};

export const FEED_FILTERS = [
  "Tonight",
  "This weekend",
  "Near me",
  "Under ₹1,000",
  "Food and drink",
  "Nightlife",
  "Wellness",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export function priceLabel(item: FeedItem): string | undefined {
  if (item.priceInr == null) return undefined;
  const base = `From ${formatPrice(item.priceInr)}`;
  return item.priceSuffix ? `${base} ${item.priceSuffix}` : base;
}
