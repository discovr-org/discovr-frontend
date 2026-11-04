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
  walkIn,
  unit = "per person",
  taxes = "inclusive",
  phone,
  hostBusinessName,
  hidden,
  onCallToBook,
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
        {askForPrice ? (
          <span className="t-price">Ask for the price</span>
        ) : (
          <>
            <span className="t-price">From {rupees(priceFrom)}</span>
            {unit || taxes === "extra" ? (
              <span className={styles.unit}>
                {[unit, taxes === "extra" ? "+ taxes" : ""].filter(Boolean).join(" ")}
              </span>
            ) : null}
          </>
        )}
        {walkIn ? <span className={styles.unit}>No booking needed, just walk in</span> : null}
      </div>
      {bookHref ? (
        <a
          className={styles.cta}
          href={bookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Book on ${hostBusinessName}'s site (opens in a new tab)`}
          data-attr="book-cta"
          onClick={() => onBookClick?.("link")}
        >
          Book on {hostBusinessName}
        </a>
      ) : onCallToBook ? (
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
