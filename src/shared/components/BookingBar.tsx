"use client";

import { useLayoutEffect, useRef } from "react";
import { rupees } from "@/features/experience/utils/schedule";
import { PhoneIcon } from "./icons";
import styles from "./BookingBar.module.css";

export interface BookingBarProps {
  priceFrom: number;
  /** Places, or listings with no published tariff. */
  askForPrice?: boolean;
  /** Places that take walk-ins: a small note says no booking is needed. */
  walkIn?: boolean;
  /** The host's own booking page. When set, the button opens it instead of calling. */
  bookHref?: string;
  /** Label for the booking-page button. Defaults to "Book on <host>". */
  bookLabel?: string;
  /** Replaces the left text ("From ₹300"). */
  leftText?: string;
  /** Replaces the small line under it. */
  leftNote?: string;
  /** What the price buys, e.g. "for two". Defaults to "per person"; empty hides it. */
  unit?: string;
  /** Adds "+ taxes" after the unit when taxes are extra. */
  taxes?: "extra" | "inclusive";
  /** E.164 phone the CTA dials when no `onCallToBook` is passed. */
  phone: string;
  hostBusinessName: string;
  hidden?: boolean;
  /**
   * When set, the bone button runs this instead of dialling immediately.
   * Use to gate the call behind login (signup prototype).
   */
  onCallToBook?: () => void;
  /** When set, the booking link runs this instead of opening `bookHref` (e.g. to gate it behind login). */
  onBookLink?: (href: string) => void;
  /** Told on every tap of the button, before it calls or opens the booking page. */
  onBookClick?: (method: "call" | "link") => void;
}

/**
 * Sticky conversion bar, one compact row: "From ₹…" + Call to book, or "Ask for the price" + Call.
 * Publishes its height as --bb-h on <html> so the page and toasts can clear it.
 */
export function BookingBar({
  priceFrom,
  askForPrice,
  bookHref,
  bookLabel,
  leftText,
  leftNote,
  walkIn,
  unit = "per person",
  taxes = "inclusive",
  phone,
  hostBusinessName,
  hidden,
  onCallToBook,
  onBookLink,
  onBookClick,
}: BookingBarProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--bb-h", `${el.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--bb-h");
    };
  }, [hidden, askForPrice, bookHref, walkIn]);

  // The left text and the line under it: the admin's words when set, else the price and its unit.
  const autoNote = askForPrice ? "" : [unit, taxes === "extra" ? "+ taxes" : ""].filter(Boolean).join(" ");
  const note = leftNote?.trim() || (leftText?.trim() ? "" : autoNote);
  const bookText = bookLabel?.trim() || `Book on ${hostBusinessName}`;
  const callLabel = `Call ${hostBusinessName} to book`;
  const callContent = (
    <>
      <PhoneIcon />
      Call to book
    </>
  );

  return (
    <footer
      ref={ref}
      className={styles.bar}
      aria-label={askForPrice ? "Ask about this place" : "Book this experience"}
      hidden={hidden}
    >
      <div className={styles.money}>
        <span className="t-price">{leftText || (askForPrice ? "Ask for the price" : `From ${rupees(priceFrom)}`)}</span>
        {note ? <span className={styles.unit}>{note}</span> : null}
        {walkIn ? <span className={styles.unit}>No booking needed, just walk in</span> : null}
      </div>
      {bookHref ? (
        <a
          className={styles.cta}
          href={bookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${bookText} (opens in a new tab)`}
          data-attr="book-cta"
          onClick={(e) => {
            onBookClick?.("link");
            if (!onBookLink) return;
            e.preventDefault();
            onBookLink(bookHref);
          }}
        >
          {bookText}
        </a>
      ) : !phone ? null : onCallToBook ? (
        <button
          type="button"
          className={styles.cta}
          data-attr="book-cta"
          onClick={() => {
            onBookClick?.("call");
            onCallToBook();
          }}
          aria-label={callLabel}
        >
          {callContent}
        </button>
      ) : (
        <a
          className={styles.cta}
          href={`tel:${phone}`}
          aria-label={callLabel}
          data-attr="book-cta"
          onClick={() => onBookClick?.("call")}
        >
          {callContent}
        </a>
      )}
    </footer>
  );
}
