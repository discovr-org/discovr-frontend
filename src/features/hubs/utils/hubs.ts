import type { FeedItem } from "@/features/home/utils/feedData";
import { areaOf } from "@/features/home/utils/feedFilters";
import { HOME_SECTIONS } from "@/features/home/utils/homeSections";
import { formatPrice } from "@/shared/utils/formatPrice";

export type Hub = {
  /** URL part: /goa/<slug> */
  slug: string;
  title: string;
  intro: string;
  items: FeedItem[];
};

/** A hub with fewer listings than this would be a thin page. */
const MIN_LISTINGS = 2;

/** Sections whose home title is too short to be a page title. */
const TOPIC_TITLE: Record<string, string> = {
  nightlife: "Nightlife in Goa",
  kayaking: "Kayaking in Goa",
};

/** Spellings we've seen for the same place. */
const AREA_ALIAS: Record<string, string> = { Panjim: "Panaji" };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function names(items: FeedItem[]): string {
  const n = items.map((i) => i.title);
  return n.length < 2 ? n.join("") : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
}

/** Plain facts first, so a search or AI answer can quote the top of the page as is. */
function intro(items: FeedItem[], where: string): string {
  const prices = items.flatMap((i) => (i.priceInr ? [i.priceInr] : []));
  const price = prices.length
    ? ` Starting prices run from ${formatPrice(Math.min(...prices))} to ${formatPrice(Math.max(...prices))}.`
    : "";
  return `${items.length} places ${where} that someone from our team has been to: ${names(items)}.${price}`;
}

export function buildHubs(cards: FeedItem[]): Hub[] {
  const bySlug = new Map(cards.map((c) => [c.slug, c]));

  const topics = HOME_SECTIONS.flatMap((s) => {
    const items = s.slugs.flatMap((slug) => bySlug.get(slug) ?? []);
    if (items.length < MIN_LISTINGS) return [];
    const title = TOPIC_TITLE[s.id] ?? s.title;
    return [{ slug: s.id, title, intro: intro(items, "in Goa"), items }];
  });

  const byArea = new Map<string, FeedItem[]>();
  for (const c of cards) {
    const raw = areaOf(c);
    const area = AREA_ALIAS[raw] ?? raw;
    byArea.set(area, [...(byArea.get(area) ?? []), c]);
  }
  const areas = [...byArea]
    .filter(([, items]) => items.length >= MIN_LISTINGS)
    .map(([area, items]) => ({
      slug: slugify(area),
      title: `Things to do in ${area}, Goa`,
      intro: intro(items, `in ${area}`),
      items,
    }));

  return [...areas, ...topics];
}

/** Topic slugs that always exist, so the route has something to build even if the API is down. */
export const FALLBACK_HUB_SLUGS = HOME_SECTIONS.map((s) => s.id);
