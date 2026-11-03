"use client";

import { useId, useState } from "react";
import styles from "./PolicyDisclosure.module.css";

export interface Policy {
  /**
   * The one line shown in green while the card is closed. The free-cancellation
   * cut-off, e.g. "Free cancellation until 6pm on the day". It must say the same
   * thing as the first cancellation pointer.
   */
  summary: string;
  /** 3 to 4 short pointers: how to book, when the spot is held, how and where to pay, who can come. */
  booking: string[];
  /** 3 to 4 short pointers: the free window, what happens after it, when the host cancels. */
  cancellation: string[];
  /** Guest note under the card: "Check the final terms on {host} before paying." */
  showFinalTermsNote?: boolean;
}

export interface PolicyDisclosureProps {
  policy: Policy;
  /** Used in the final-terms note under the card. */
  hostName: string;
  /** Closed by default. Render with `key={experience.slug}` so it closes again when the listing changes. */
  defaultOpen?: boolean;
}

/**
 * Booking and cancellation policy: a raised card that toggles open.
 * Closed, it shows the title. Open, it shows a
 * "Booking policy" group and a "Cancellation policy" group of dotted pointers.
 * Opens instantly (no height animation); only the chevron turns.
 */
export function PolicyDisclosure({
  policy,
  hostName,
  defaultOpen = false,
}: PolicyDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const showNote = policy.showFinalTermsNote !== false;

  return (
    <section aria-label="Booking and cancellation policy">
      <div className={styles.card}>
        <h2 className={styles.heading}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
          >
            <FileTextIcon />
            <span className={styles.text}>
              <span className={styles.title}>Booking and cancellation policy</span>
            </span>
            <ChevronDownIcon className={styles.chevron} />
          </button>
        </h2>
        <div className={styles.body} id={bodyId} hidden={!open}>
          <PolicyGroup title="Booking policy" items={policy.booking} />
          <PolicyGroup title="Cancellation policy" items={policy.cancellation} />
        </div>
      </div>
      {showNote ? (
        <p className={styles.finalNote}>
          Check the final terms on {hostName} before paying.
        </p>
      ) : null}
    </section>
  );
}

function PolicyGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className={styles.list}>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/* Lucide file-text and chevron-down, inlined so this file has no other dependencies. */
function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
