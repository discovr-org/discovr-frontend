"use client";

import { useEffect, useEffectEvent, useRef } from "react";

/** Counts as seen once at least half of it stays on screen this long. */
const DWELL_MS = 1000;

type Watch = { onSeen: () => void; timer?: number };

let observer: IntersectionObserver | null = null;
const watches = new Map<Element, Watch>();

/** One observer for every tracked element on the page. */
function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const watch = watches.get(entry.target);
        if (!watch) continue;
        if (isSeen(entry)) {
          watch.timer ??= window.setTimeout(() => {
            unwatch(entry.target);
            watch.onSeen();
          }, DWELL_MS);
        } else if (watch.timer !== undefined) {
          window.clearTimeout(watch.timer);
          watch.timer = undefined;
        }
      }
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  return observer;
}

/** Half of it is on screen, or it's taller than the screen and fills half of it. */
function isSeen(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  const screen = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= screen / 2;
}

function unwatch(el: Element): void {
  const watch = watches.get(el);
  if (watch?.timer !== undefined) window.clearTimeout(watch.timer);
  watches.delete(el);
  observer?.unobserve(el);
}

/**
 * Fires `onSeen` once per mount when the element is at least 50% on screen (or fills half
 * the screen) for 1 second. Zero-height markers count as soon as they're on screen.
 * Attach the returned ref to the element. Change `key` to watch again (e.g. a new listing).
 */
export function useTrackView<T extends Element>(onSeen: () => void, key: string = "") {
  const ref = useRef<T>(null);
  const fire = useEffectEvent(onSeen);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    watches.set(el, { onSeen: () => fire() });
    sharedObserver().observe(el);
    return () => unwatch(el);
  }, [key]);

  return ref;
}
