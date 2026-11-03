import type { FeedItem } from "./feedData";
import { HOME_SECTIONS } from "./homeSections";

/** Lowercase and strip accents: "Ānamiva" → "anamiva". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function words(text: string): string[] {
  return normalize(text).split(/[^a-z0-9₹]+/).filter(Boolean);
}

/** Levenshtein distance capped at 2. */
function closeEnough(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length] <= 1;
}

/** 0 = no match; higher is better. */
function tokenScore(token: string, fieldWords: string[], weight: number, fuzzy: boolean): number {
  let best = 0;
  for (const w of fieldWords) {
    if (w === token) best = Math.max(best, 3 * weight);
    else if (w.startsWith(token)) best = Math.max(best, 2 * weight);
    else if (token.length >= 4 && w.includes(token)) best = Math.max(best, weight);
    else if (fuzzy && token.length >= 5 && (closeEnough(token, w) || closeEnough(token, w.slice(0, token.length))))
      best = Math.max(best, weight);
  }
  return best;
}

const sectionTitlesBySlug = new Map<string, string[]>();
for (const section of HOME_SECTIONS) {
  for (const slug of section.slugs) {
    sectionTitlesBySlug.set(slug, [...(sectionTitlesBySlug.get(slug) ?? []), section.title]);
  }
}

/**
 * Every word in the query must match the card's title, place, blurb, or the
 * home sections it sits in (so "nightlife" or "sundowners" work). Prefixes count;
 * one-letter typos only when nothing matches exactly. Best matches first.
 */
export function searchCards(items: FeedItem[], query: string): FeedItem[] {
  const tokens = words(query);
  if (!tokens.length) return [];
  const exact = rank(items, tokens, false);
  return exact.length ? exact : rank(items, tokens, true);
}

function rank(items: FeedItem[], tokens: string[], fuzzy: boolean): FeedItem[] {
  const scored: { item: FeedItem; score: number }[] = [];
  for (const item of items) {
    const fields: [string[], number][] = [
      [words(item.title), 4],
      [words(item.placeLabel), 3],
      [words((sectionTitlesBySlug.get(item.slug) ?? []).join(" ")), 2],
      [words(item.blurb ?? ""), 1],
    ];
    let total = 0;
    for (const token of tokens) {
      const s = Math.max(...fields.map(([fw, weight]) => tokenScore(token, fw, weight, fuzzy)));
      if (!s) {
        total = 0;
        break;
      }
      total += s;
    }
    if (total) scored.push({ item, score: total });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}
