import { formatPrice } from "@/shared/utils/formatPrice";

export type FeedItem = {
  slug: string;
  title: string;
  placeLabel: string;
  imageSrc: string;
  imageAlt: string;
  blurb?: string;
  durationLabel?: string;
  priceInr?: number;
  /** e.g. "+ taxes" */
  priceSuffix?: string;
};

export type FeedSection = {
  id: string;
  title: string;
  /** portrait carousel vs full-width shortlist cards */
  density: "portrait" | "landscape";
  items: FeedItem[];
};

export const FEED_FILTERS = [
  "Tonight",
  "This weekend",
  "Near me",
  "Under ₹2,000",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export function priceLabel(item: FeedItem): string | undefined {
  if (item.priceInr == null) return undefined;
  const base = `From ${formatPrice(item.priceInr)}`;
  return item.priceSuffix ? `${base} ${item.priceSuffix}` : base;
}
