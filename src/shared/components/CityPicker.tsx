"use client";

import { useEffect, useId, useRef } from "react";
import { CheckIcon, ChevronDownIcon, CrossIcon } from "./icons";
import styles from "./CityPicker.module.css";

type CityPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** "Goa ⌄" in the desktop bar. Goa is the only city for now. */
export function CityPicker({ open, onOpenChange }: CityPickerProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const opener = trigger.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Goa, change city"
        onClick={() => onOpenChange(!open)}
      >
        <span>Goa</span>
        <ChevronDownIcon />
      </button>
      <div
        className={styles.scrim}
        data-state={open ? "open" : "closed"}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        data-state={open ? "open" : "closed"}
        className={styles.panel}
      >
        <div className={styles.head}>
          <h2 className={styles.title} id={titleId}>
            Choose a city
          </h2>
          <span className={styles.slot} aria-hidden="true" />
        </div>
        <div className={styles.picker}>
          <div role="listbox" aria-label="Cities" className={styles.rows}>
            <button
              type="button"
              role="option"
              aria-selected="true"
              aria-current="true"
              className={`${styles.row} ${styles.selected}`}
              data-autofocus=""
              onClick={() => onOpenChange(false)}
            >
              <span className={styles.rowName}>Goa</span>
              <CheckIcon />
            </button>
          </div>
          <p className={styles.more}>More cities coming soon</p>
        </div>
        <button type="button" aria-label="Close" className={styles.close} onClick={() => onOpenChange(false)}>
          <CrossIcon />
        </button>
      </div>
    </>
  );
}
