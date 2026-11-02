"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export interface ScrollChrome {
  /** AppBar is solid (past the gallery, with the title) rather than transparent over it. */
  solid: boolean;
  /** AppBar slid up out of view. Kept for the AppBar API; the detail screen never hides it. */
  barHidden: boolean;
  /** TabBar in view (and the BookingBar lifted on top of it). Always on. */
  tabShown: boolean;
  /** No-op: both bars are always shown. */
  reveal: () => void;
}

/**
 * The detail screen's bars: the BookingBar and TabBar are always on screen.
 * Over the photo the AppBar is transparent (back, share, heart); past it, it turns
 * into a slim solid bar with the name.
 */
export function useScrollChrome(
  heroRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>,
  { forceShown = false }: { held?: boolean; forceShown?: boolean } = {},
): ScrollChrome {
  const [solid, setSolid] = useState(forceShown);

  const update = useCallback(() => {
    if (forceShown) {
      setSolid(true);
      return;
    }
    const hero = heroRef.current;
    const barH = barRef.current?.offsetHeight ?? 56;
    setSolid(hero ? hero.getBoundingClientRect().bottom <= barH : true);
  }, [heroRef, barRef, forceShown]);

  useEffect(() => {
    const first = requestAnimationFrame(update);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const reveal = useCallback(() => {}, []);

  return { solid, barHidden: false, tabShown: true, reveal };
}
