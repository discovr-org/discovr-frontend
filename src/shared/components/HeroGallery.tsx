"use client";

import Image from "next/image";
import { forwardRef, useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Photo } from "@/types/experience";
import { IconButton } from "./IconButton";
import { BackIcon, ChevronRightIcon } from "./icons";
import styles from "./HeroGallery.module.css";

export interface HeroGalleryProps {
  photos: Photo[];
  /** Told each time a swipe or arrow lands on a different photo (0-based). */
  onIndexChange?: (index: number, total: number) => void;
}

/**
 * Swipeable full-bleed gallery: one photo per flick, a "1 / 4" count,
 * previous/next buttons on pointer devices, arrow keys when focused.
 * The ref points at the outer hero box, which the scroll behaviour measures.
 */
export const HeroGallery = forwardRef<HTMLDivElement, HeroGalleryProps>(function HeroGallery({ photos, onIndexChange }, ref) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const landed = useEffectEvent((next: number) => onIndexChange?.(next, total));

  const current = useCallback(() => {
    const g = galleryRef.current;
    return g ? Math.round(g.scrollLeft / g.clientWidth) : 0;
  }, []);

  useEffect(() => {
    const g = galleryRef.current;
    if (!g) return;
    let raf = 0;
    let last = current();
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = current();
        setIndex(next);
        if (next !== last) {
          last = next;
          landed(next);
        }
      });
    };
    g.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      g.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [current]);

  const go = (delta: number) => {
    const g = galleryRef.current;
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    g.scrollTo({ left: (current() + delta) * g.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.hero} ref={ref}>
      <div
        ref={galleryRef}
        className={styles.gallery}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
      >
        {photos.map((p, i) => (
          <figure key={p.src} className={styles.slide}>
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
            />
          </figure>
        ))}
      </div>
      {total > 1 && (
        <>
          <IconButton label="Previous photo" scrimmed className={`${styles.nav} ${styles.prev}`} disabled={index === 0} onClick={() => go(-1)}>
            <BackIcon />
          </IconButton>
          <IconButton label="Next photo" scrimmed className={`${styles.nav} ${styles.next}`} disabled={index === total - 1} onClick={() => go(1)}>
            <ChevronRightIcon />
          </IconButton>
          <span className={styles.count} aria-live="polite">
            {index + 1} / {total}
          </span>
        </>
      )}
    </div>
  );
});

/** The sunken placeholder used by the error state, same box as the gallery. */
export const HeroPlaceholder = forwardRef<HTMLDivElement>(function HeroPlaceholder(_, ref) {
  return <div className={styles.hero} ref={ref} />;
});
