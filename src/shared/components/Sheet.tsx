"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ChevronRightIcon } from "./icons";
import styles from "./Sheet.module.css";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Bottom sheet: top corners rounded, surface-canvas scrim at 60%, grab handle.
 * Closes on scrim tap and Escape, traps focus while open, returns focus to the opener,
 * and stops the page behind from scrolling.
 */
export function Sheet({ open, onClose, title, subtitle, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const first = ref.current?.querySelector<HTMLElement>("a,button");
      (first ?? ref.current)?.focus();
    }, 180);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !ref.current) return;
      const f = ref.current.querySelectorAll<HTMLElement>("a,button");
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
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <span className="t-title" id={titleId}>
            {title}
          </span>
          {subtitle && <span className={styles.sub}>{subtitle}</span>}
        </div>
        {children}
      </div>
    </>
  );
}

export interface SheetOptionProps {
  href: string;
  icon: ReactNode;
  title: string;
  sub: string;
  external?: boolean;
  onClick?: () => void;
}

export function SheetOptions({ children }: { children: ReactNode }) {
  return <div className={styles.options}>{children}</div>;
}

/** A 48px+ row: icon, title over sub-line, chevron. A real link. */
export function SheetOption({ href, icon, title, sub, external, onClick }: SheetOptionProps) {
  return (
    <a
      className={styles.option}
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon}
      <span className={styles.optionText}>
        <span className={styles.optionTitle}>{title}</span>
        <span className={styles.optionSub}>{sub}</span>
      </span>
      <ChevronRightIcon className={styles.chev} />
    </a>
  );
}
