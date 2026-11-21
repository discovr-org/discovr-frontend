import type { ActionButtonId } from "@/shared/components/ActionRow";

/** Where the order and visibility live: the listing's content, or its category's layout. */
type SectionHolder = { sections?: Array<{ id: string; show?: boolean }>; actionButtons?: ActionButtonId[] } | undefined;

/** Parts of the listing page the admin can order and hide. */
export type SectionId = "title" | "info" | "verdict" | "actions" | "about" | "menu" | "policy" | "host" | "reviews";

/** The page as it has always been. A listing with no saved layout renders in exactly this order. */
export const DEFAULT_SECTIONS: SectionId[] = ["title", "info", "verdict", "actions", "about", "menu", "policy", "host", "reviews"];

/** Parts that keep their place but can be hidden. */
export type FixedId = "gallery" | "more" | "booking";

/** Saved layout merged with the default: unknown ids dropped, missing ones kept in their default place. */
export function orderedSections(content: SectionHolder): Array<{ id: SectionId; show: boolean }> {
  const saved = content?.sections ?? [];
  const known = new Set<string>(DEFAULT_SECTIONS);
  const out = saved
    .filter((s, i) => known.has(s.id) && saved.findIndex((x) => x.id === s.id) === i)
    .map((s) => ({ id: s.id as SectionId, show: s.show !== false }));
  for (const id of DEFAULT_SECTIONS) {
    if (out.some((s) => s.id === id)) continue;
    // Keep a missing part right after the part that precedes it by default.
    const prev = DEFAULT_SECTIONS[DEFAULT_SECTIONS.indexOf(id) - 1];
    const at = prev ? out.findIndex((s) => s.id === prev) + 1 : 0;
    out.splice(at, 0, { id, show: true });
  }
  return out;
}

/** Fixed parts (photos, More in Goa, booking bar) are shown unless the admin switched them off. */
export function isFixedShown(content: SectionHolder, id: FixedId): boolean {
  const saved = content?.sections?.find((s) => s.id === id);
  return saved ? saved.show !== false : true;
}
