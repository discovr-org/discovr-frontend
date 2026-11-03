"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MenuPage } from "@/types/experience";
import { IconButton } from "./IconButton";
import { BackIcon, ChevronRightIcon, CrossIcon, ZoomInIcon, ZoomOutIcon } from "./icons";
import styles from "./MenuViewer.module.css";

export interface MenuViewerProps {
  open: boolean;
  /** Page to show when it opens. */
  startIndex: number;
  pages: MenuPage[];
  /** e.g. "Maria's Kitchen" (the bar reads "Maria's Kitchen menu") */
  venueName: string;
  onClose: () => void;
}

/**
 * Full-screen menu reader. Swipe between pages (one per flick), double-tap or the zoom
 * button for 200% around the tap point, Escape or close to leave. Focus is trapped while
 * open, the page behind doesn't scroll, and focus returns to whatever opened it.
 */
export function MenuViewer({ open, startIndex, pages, venueName, onClose }: MenuViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const pendingFocus = useRef<{ fx: number; fy: number } | null>(null);
  const lastTap = useRef(0);
  const n = pages.length;

  const current = useCallback(() => {
    const el = pagesRef.current;
    return el ? Math.round(el.scrollLeft / el.clientWidth) : 0;
  }, []);

  // Open: jump to the start page, lock the page behind, move focus in.
  useLayoutEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    setZoomed(false);
    const el = pagesRef.current;
    if (el) {
      el.style.scrollSnapType = "none";
      el.scrollLeft = startIndex * el.clientWidth;
      el.style.scrollSnapType = "";
    }
    setIndex(startIndex);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 180);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, startIndex]);

  // Keep the count in step with swiping.
  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(Math.min(current(), n - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [current, n]);

  const setZoom = useCallback(
    (on: boolean, clientX?: number, clientY?: number) => {
      const slide = pagesRef.current?.children[current()] as HTMLElement | undefined;
      const page = slide?.firstElementChild as HTMLElement | undefined;
      if (on && page) {
        const r = page.getBoundingClientRect();
        pendingFocus.current = {
          fx: clientX != null ? (clientX - r.left) / r.width : 0.5,
          fy: clientY != null ? (clientY - r.top) / r.height : 0.3,
        };
      }
      pagesRef.current?.querySelectorAll<HTMLElement>(`.${styles.slide}`).forEach((s) => {
        s.scrollTop = 0;
        s.scrollLeft = 0;
      });
      setZoomed(on);
    },
    [current],
  );

  // After zooming in, centre the point that was tapped.
  useLayoutEffect(() => {
    if (!zoomed || !pendingFocus.current) return;
    const slide = pagesRef.current?.children[current()] as HTMLElement | undefined;
    const page = slide?.firstElementChild as HTMLElement | undefined;
    if (slide && page) {
      const r = page.getBoundingClientRect();
      slide.scrollLeft = Math.max(0, pendingFocus.current.fx * r.width - slide.clientWidth / 2);
      slide.scrollTop = Math.max(0, pendingFocus.current.fy * r.height - slide.clientHeight / 2);
    }
    pendingFocus.current = null;
  }, [zoomed, current]);

  const go = useCallback(
    (d: number) => {
      if (zoomed) setZoom(false);
      const el = pagesRef.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: (current() + d) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
    },
    [current, setZoom, zoomed],
  );

  const close = useCallback(() => {
    setZoom(false);
    onCloseRef.current();
  }, [setZoom]);

  // Keys work wherever focus is while the reader is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight" && !zoomed) {
        e.preventDefault();
        return go(1);
      }
      if (e.key === "ArrowLeft" && !zoomed) {
        e.preventDefault();
        return go(-1);
      }
      if (e.key !== "Tab" || !rootRef.current) return;
      const f = Array.from(rootRef.current.querySelectorAll<HTMLButtonElement>("button")).filter((b) => !b.disabled && b.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, zoomed, go, close]);

  const label = pages[index]?.label ?? "";

  return (
    <div
      ref={rootRef}
      className={`${styles.viewer} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${venueName} menu`}
      aria-hidden={!open}
    >
      <div className={styles.bar}>
        <IconButton ref={closeRef} label="Close menu" onClick={close}>
          <CrossIcon />
        </IconButton>
        <div className={styles.title}>
          <span className={styles.name}>{venueName} menu</span>
          <span className={styles.count} aria-live="polite">
            {index + 1} of {n}
            {label ? ` · ${label}` : ""}
          </span>
        </div>
        <IconButton
          label={zoomed ? "Zoom out" : "Zoom in"}
          pressed={zoomed}
          className={zoomed ? styles.zoomOn : undefined}
          onClick={() => setZoom(!zoomed)}
        >
          {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
        </IconButton>
      </div>

      <div className={styles.stage}>
        <div
          ref={pagesRef}
          className={`${styles.pages} ${zoomed ? styles.zoomed : ""}`}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest(`.${styles.page}`)) setZoom(!zoomed, e.clientX, e.clientY);
          }}
          onTouchEnd={(e) => {
            if (!(e.target as HTMLElement).closest(`.${styles.page}`) || e.changedTouches.length !== 1) return;
            const now = Date.now();
            const t = e.changedTouches[0];
            if (now - lastTap.current < 300) {
              e.preventDefault();
              setZoom(!zoomed, t.clientX, t.clientY);
              lastTap.current = 0;
            } else lastTap.current = now;
          }}
        >
          {pages.map((p, i) => (
            <div key={p.src} className={styles.slide} role="group" aria-roledescription="page" aria-label={p.label ? `${i + 1} of ${n}: ${p.label}` : `${i + 1} of ${n}`}>
              <div className={styles.page}>
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 480px) 200vw, 960px" loading={open ? "eager" : "lazy"} />
              </div>
            </div>
          ))}
        </div>
        <IconButton label="Previous page" scrimmed className={`${styles.nav} ${styles.prev}`} disabled={index === 0 || zoomed} onClick={() => go(-1)}>
          <BackIcon />
        </IconButton>
        <IconButton label="Next page" scrimmed className={`${styles.nav} ${styles.next}`} disabled={index === n - 1 || zoomed} onClick={() => go(1)}>
          <ChevronRightIcon />
        </IconButton>
      </div>

      <div className={styles.foot}>Double-tap a page to zoom. Swipe for the next one.</div>
    </div>
  );
}
