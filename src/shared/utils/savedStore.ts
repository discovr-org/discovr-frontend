"use client";

const KEY = "discovr.saved";

export function readSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeSavedSlugs(slugs: string[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(slugs));
}

export function toggleSavedSlug(slug: string): string[] {
  const current = readSavedSlugs();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  writeSavedSlugs(next);
  return next;
}
