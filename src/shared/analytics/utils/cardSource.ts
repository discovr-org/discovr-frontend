import type { CardList, CardProps } from "./events";

/** What a card needs to describe itself in events. Built from a feed item and its index. */
export type CardTrack = Pick<CardProps, "slug" | "format" | "price_inr" | "place"> & {
  position: number;
};

export function cardTrack(
  item: { slug: string; format?: "trip" | "venue"; priceInr?: number; placeLabel?: string },
  index: number,
): CardTrack {
  return {
    slug: item.slug,
    format: item.format,
    price_inr: item.priceInr,
    place: item.placeLabel,
    position: index + 1,
  };
}

type Source = {
  list: CardList;
  section?: string;
  sectionTitle?: string;
  position: number; slug: string };
const KEY = "discovr.analytics.source";

/** Remember which card opened a listing, so experience_viewed can say where the visit came from. */
export function rememberCardSource(card: CardProps): void {
  try {
    const source: Source = {
      list: card.list,
      section: card.section_id,
      sectionTitle: card.section_title,
      position: card.position,
      slug: card.slug,
    };
    window.sessionStorage.setItem(KEY, JSON.stringify(source));
  } catch {
    // Private mode or full storage: the visit just has no source.
  }
}

/** Read and clear the source, only if it was for this listing. */
export function takeCardSource(slug: string): Omit<Source, "slug"> | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const { slug: from, ...rest } = JSON.parse(raw) as Source;
    return from === slug ? rest : null;
  } catch {
    return null;
  }
}
