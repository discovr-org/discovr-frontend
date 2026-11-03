"use client";

import { useEffect } from "react";
import { track } from "./track";

const MILESTONES = [25, 50, 75, 100] as const;

/** Sends scroll_depth at 25, 50, 75 and 100% of the page, once each per page view. */
export function useScrollDepth(slug?: string): void {
  useEffect(() => {
    const sent = new Set<number>();
    let frame = 0;

    const check = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      for (const depth of MILESTONES) {
        // 100 means within a couple of pixels of the bottom.
        const reached = depth === 100 ? scrollable - window.scrollY <= 2 : percent >= depth;
        if (reached && !sent.has(depth)) {
          sent.add(depth);
          track("scroll_depth", slug ? { depth, slug } : { depth });
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [slug]);
}
