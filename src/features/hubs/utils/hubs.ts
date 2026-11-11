import type { FeedItem } from "@/features/home/utils/feedData";
import { areaOf } from "@/features/home/utils/feedFilters";
import { HOME_SECTIONS } from "@/features/home/utils/homeSections";
import { GUIDES, type Guide } from "@/features/hubs/utils/guides";
import { formatPrice } from "@/shared/utils/formatPrice";

export type Hub = {
  /** URL part: /goa/<slug> */
  slug: string;
  title: string;
  intro: string;
  items: FeedItem[];
  /** Hand-written answer, comparison table and FAQs, where we have them. */
  guide?: Guide;
};

/** A hub with fewer listings than this would be a thin page. */
const MIN_LISTINGS = 2;

/** Sections whose home title is too short to be a page title. */
const TOPIC_TITLE: Record<string, string> = {
  nightlife: "Nightlife in Goa",
  kayaking: "Kayaking in Goa",
  sundowners: "Best sunset spots in Goa",
};

/** URL part when the section id isn't what people search. */
const TOPIC_SLUG: Record<string, string> = { sundowners: "sunset-spots" };

/** Pages that pull from several home sections, named after the way people ask. */
const COLLECTIONS = [
  {
    slug: "at-night",
    title: "What to do in Goa at night",
    from: ["nightlife", "cocktails", "local-bars"],
  },
];

/** Spellings we've seen for the same place. */
const AREA_ALIAS: Record<string, string> = { Panjim: "Panaji" };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function names(items: FeedItem[]): string {
  const n = items.map((i) => i.title);
  return n.length < 2 ? n.join("") : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
}

/** Plain facts first, so a search or AI answer can quote the top of the page as is. */
function intro(items: FeedItem[], where: string): string {
  // Venue prices mix entry fees and spend per person, so only trips quote a price.
  const prices = items.flatMap((i) => (i.format === "trip" && i.priceInr ? [i.priceInr] : []));
  const price = prices.length
    ? ` Trips start from ${formatPrice(Math.min(...prices))} to ${formatPrice(Math.max(...prices))} a person.`
    : "";
  return `${items.length} places ${where} that someone from our team has been to: ${names(items)}.${price}`;
}

export function buildHubs(cards: FeedItem[]): Hub[] {
  const bySlug = new Map(cards.map((c) => [c.slug, c]));

  const topics = HOME_SECTIONS.flatMap((s) => {
    const items = s.slugs.flatMap((slug) => bySlug.get(slug) ?? []);
    if (items.length < MIN_LISTINGS) return [];
    const title = TOPIC_TITLE[s.id] ?? s.title;
    const slug = TOPIC_SLUG[s.id] ?? s.id;
    const guide = GUIDES[slug];
    return [{ slug, title, intro: guide?.answer ?? intro(items, "in Goa"), items, guide }];
  });

  const collections = COLLECTIONS.flatMap((c) => {
    const slugs = new Set(HOME_SECTIONS.filter((s) => c.from.includes(s.id)).flatMap((s) => s.slugs));
    const items = [...slugs].flatMap((slug) => bySlug.get(slug) ?? []);
    return items.length < MIN_LISTINGS
      ? []
      : [{ slug: c.slug, title: c.title, intro: GUIDES[c.slug]?.answer ?? intro(items, "in Goa after dark"), items, guide: GUIDES[c.slug] }];
  });

  const byArea = new Map<string, FeedItem[]>();
  for (const c of cards) {
    const raw = areaOf(c);
    const area = AREA_ALIAS[raw] ?? raw;
    byArea.set(area, [...(byArea.get(area) ?? []), c]);
  }
  const areas = [...byArea]
    .filter(([, items]) => items.length >= MIN_LISTINGS)
    .map(([area, items]) => {
      const slug = slugify(area);
      const guide = GUIDES[slug];
      return { slug, title: `Things to do in ${area}, Goa`, intro: guide?.answer ?? intro(items, `in ${area}`), items, guide };
    });

  return [...collections, ...areas, ...topics];
}

/** Topic slugs that always exist, so the route has something to build even if the API is down. */
export const FALLBACK_HUB_SLUGS = ["at-night", ...HOME_SECTIONS.map((s) => TOPIC_SLUG[s.id] ?? s.id)];
