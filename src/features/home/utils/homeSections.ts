import type { FeedItem, FeedSection, SectionLayout } from "./feedData";

type HomeSectionDef = {
  id: string;
  title: string;
  layout: SectionLayout;
  /** Listing slugs, in the order they show. */
  slugs: string[];
};

/** The home feed, top to bottom. Add, move or edit sections here. */
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
    slugs: ["juna", "raeeth", "the-loft-at-anamiva", "hideaway", "boilermaker"],
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
    layout: "stack",
    slugs: ["baga-mangrove-kayaking", "palolem-beach-kayaking"],
  },
  { id: "pottery", title: "Pottery", layout: "stack", slugs: ["mati-earth-studio"] },
  { id: "tattoo", title: "Tattoo", layout: "stack", slugs: ["angel-tattoo"] },
];

/** Fill each section with the cards the API returned. Sections with no live cards are dropped. */
export function buildHomeSections(cards: FeedItem[]): FeedSection[] {
  const bySlug = new Map(cards.map((card) => [card.slug, card]));
  return HOME_SECTIONS.map(({ slugs, ...section }) => ({
    ...section,
    items: slugs.flatMap((slug) => bySlug.get(slug) ?? []),
  })).filter((section) => section.items.length > 0);
}
