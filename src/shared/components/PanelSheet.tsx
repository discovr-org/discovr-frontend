"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CrossIcon } from "./icons";
import styles from "./PanelSheet.module.css";

export interface PanelSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned under the body, e.g. Clear + Show results. */
  footer?: ReactNode;
  /** Desktop placement: a popover under the top bar, right-aligned by default. */
  align?: "end" | "start";
}

/**
 * Bottom sheet on phones (handle, title, round close button); a 360px popover
 * under the top bar on desktop. Escape and scrim close it.
 */
export function PanelSheet({ open, onClose, title, children, footer, align = "end" }: PanelSheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => ref.current?.focus(), 180);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  const state = open ? "open" : "closed";
  return (
    <>
      <div className={styles.scrim} data-state={state} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        data-state={state}
        className={`${styles.sheet} ${align === "start" ? styles.start : ""}`}
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <span className={styles.slot} aria-hidden="true" />
        </div>
        <div className={styles.body}>{children}</div>
        <button type="button" aria-label="Close" className={styles.close} onClick={onClose}>
          <CrossIcon />
        </button>
        {footer}
      </div>
    </>
  );
}
