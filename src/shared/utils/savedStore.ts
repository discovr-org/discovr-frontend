"use client";

const KEY = "discovr.saved";
export const SAVED_CHANGED_EVENT = "discovr:saved-changed";

export function readSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.length > 0)
      : [];
  } catch {
    return [];
  }
}

export function writeSavedSlugs(slugs: string[]): void {
  const unique = [...new Set(slugs.filter(Boolean))];
  window.localStorage.setItem(KEY, JSON.stringify(unique));
  window.dispatchEvent(
    new CustomEvent(SAVED_CHANGED_EVENT, { detail: unique }),
  );
}

export function toggleSavedSlug(slug: string): string[] {
  const current = readSavedSlugs();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  writeSavedSlugs(next);
  return next;
}

export function mergeSavedSlugs(extra: string[]): string[] {
  const next = [...new Set([...readSavedSlugs(), ...extra])];
  writeSavedSlugs(next);
  return next;
}
