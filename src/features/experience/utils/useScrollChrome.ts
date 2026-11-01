"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Ignore scroll movements smaller than space-2 (8px), or a resting thumb makes the bars flicker. */
const DELTA = 8;

export interface ScrollChrome {
  /** AppBar is solid (past the gallery) rather than transparent over it. */
  solid: boolean;
  /** AppBar slid up out of view. */
  barHidden: boolean;
  /** TabBar slid into view (and the BookingBar lifted on top of it). */
  tabShown: boolean;
  /** Bring both bars back, e.g. when keyboard focus enters one of them. */
  reveal: () => void;
}

/**
 * The detail screen's bar behaviour:
 * - any of the hero under the AppBar: transparent AppBar, TabBar hidden
 * - past the hero, scrolling down: AppBar and TabBar hidden
 * - past the hero, scrolling up by 8px+, or at the bottom of the page: both shown
 * - while `held` (a sheet is open): nothing moves
 */
export function useScrollChrome(
  heroRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>,
  { held = false, forceShown = false }: { held?: boolean; forceShown?: boolean } = {},
): ScrollChrome {
  const [solid, setSolid] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const [tabShown, setTabShown] = useState(false);
  const lastY = useRef(0);
  const heldRef = useRef(held);
  heldRef.current = held;

  const update = useCallback(() => {
    if (forceShown) {
      setSolid(true);
      setBarHidden(false);
      setTabShown(true);
      return;
    }
    const y = window.scrollY;
    const hero = heroRef.current;
    const barH = barRef.current?.offsetHeight ?? 56;
    const overHero = hero ? hero.getBoundingClientRect().bottom > barH : false;
    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
    setSolid(!overHero);
    if (heldRef.current) {
      lastY.current = y;
      return;
    }
    if (overHero) {
      setBarHidden(false);
      setTabShown(false);
      lastY.current = y;
      return;
    }
    if (atBottom || lastY.current - y > DELTA) {
      setBarHidden(false);
      setTabShown(true);
    } else if (y - lastY.current > DELTA) {
      setBarHidden(true);
      setTabShown(false);
    }
    if (Math.abs(y - lastY.current) > DELTA) lastY.current = y;
  }, [heroRef, barRef, forceShown]);

  useEffect(() => {
    lastY.current = window.scrollY;
    update();
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const reveal = useCallback(() => {
    setBarHidden(false);
    setTabShown((shown) => shown || (heroRef.current ? heroRef.current.getBoundingClientRect().bottom <= (barRef.current?.offsetHeight ?? 56) : true));
  }, [heroRef, barRef]);

  return { solid, barHidden, tabShown, reveal };
}
