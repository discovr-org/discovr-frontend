import type { FeedItem, FeedSection, SectionLayout } from "./feedData";

export type HomeSectionDef = {
  id: string;
  title: string;
  layout: SectionLayout;
  /** Listing slugs, in the order they show. */
  slugs: string[];
};

/** The built-in feed. Used until the admin saves one, and by search and the topic pages. */
export const HOME_SECTIONS: HomeSectionDef[] = [
  {
    id: "sundowners",
    title: "The best sundowners of North Goa",
    layout: "rail",
    slugs: ["pisco-by-the-beach", "bastian-riviera", "slow-tide", "paloma"],
  },
  {
    id: "nightlife",
    title: "Nightlife",
    layout: "rail",
    slugs: ["juna", "raeeth", "the-loft-at-anamiva", "hideaway"],
  },
  { id: "surfing", title: "Surfing", layout: "stack", slugs: ["surf-wala"] },
  {
    id: "local-bars",
    title: "The OG local bars of Goa",
    layout: "rail",
    slugs: ["cajy-bar", "pablos"],
  },
  { id: "wakeboarding", title: "Wakeboarding", layout: "stack", slugs: ["101-wakepark"] },
  { id: "padel", title: "Padel", layout: "stack", slugs: ["coco-padel"] },
  {
    id: "cocktails",
    title: "The finest cocktails of Goa",
    layout: "rail",
    slugs: ["drop-dead-sexy", "boilermaker", "mtw-bar-and-toasties"],
  },
  {
    id: "goan-local",
    title: "Eat and drink like a Goan local",
    layout: "rail",
    slugs: ["bombil", "vinayak-family-restaurant", "kokni-kanteen", "ritz-classic-panjim"],
  },
  {
    id: "kayaking",
    title: "Kayaking",
    layout: "rail",
    slugs: ["baga-mangrove-kayaking", "palolem-beach-kayaking"],
  },
  { id: "pottery", title: "Pottery", layout: "stack", slugs: ["mati-earth-studio"] },
  { id: "tattoo", title: "Tattoo", layout: "stack", slugs: ["angel-tattoo"] },
];

/** The admin's sections when it saved some, else the built-in feed. */
export const sectionsOf = (saved?: HomeSectionDef[] | null): HomeSectionDef[] => (saved?.length ? saved : HOME_SECTIONS);

const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Fill each section with the cards the API returned. A listing shows once on the page:
 * if a slug sits in two sections, only the first keeps it. Sections with no live cards are dropped,
 * and a section left with one card shows it full width instead of as a rail.
 *
 * Categories come for free: any live listing not placed by a section joins the row of its category
 * (a section whose id or title is the category's slug or name), or gets a row of its own after the others.
 * So a new category shows on the home page once one of its listings is live, with nothing to add by hand.
 */
export function buildHomeSections(cards: FeedItem[], defs: HomeSectionDef[] = HOME_SECTIONS): FeedSection[] {
  const bySlug = new Map(cards.map((card) => [card.slug, card]));
  const shown = new Set<string>();
  const sections: FeedSection[] = defs.map(({ slugs, layout, ...section }) => {
    const items = slugs.flatMap((slug) => {
      const card = bySlug.get(slug);
      if (!card || shown.has(slug)) return [];
      shown.add(slug);
      return [card];
    });
    return { ...section, layout, items };
  });

  const groups = new Map<string, { name: string; items: FeedItem[] }>();
  for (const card of cards) {
    if (!card.categorySlug || !card.categoryName || shown.has(card.slug)) continue;
    const group = groups.get(card.categorySlug) ?? { name: card.categoryName, items: [] };
    group.items.push(card);
    groups.set(card.categorySlug, group);
  }
  const extra: FeedSection[] = [];
  for (const [slug, group] of [...groups].sort((a, b) => b[1].items.length - a[1].items.length || a[1].name.localeCompare(b[1].name))) {
    const home = sections.find((x) => x.id === slug || norm(x.title) === norm(group.name));
    if (home) home.items.push(...group.items);
    else extra.push({ id: slug, title: group.name, layout: "rail", items: group.items });
  }

  return [...sections, ...extra]
    .filter((section) => section.items.length > 0)
    .map((section) => ({ ...section, layout: section.items.length === 1 ? ("stack" as const) : section.layout }));
}
