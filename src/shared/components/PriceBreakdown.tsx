"use client";

import { formatPrice } from "@/shared/utils/formatPrice";
import styles from "./PriceBreakdown.module.css";

export type PriceLine = {
  id: string;
  label: string;
  /** Rupee amount. Omit when using `display` instead. */
  amount?: number;
  /** e.g. "Included" — takes precedence over amount. */
  display?: string;
  tone?: "discount" | "included" | "neutral";
  /** Opens fee explanation (Sheet / Dialog). */
  onExplain?: () => void;
  explainLabel?: string;
};

export type PriceBreakdownProps = {
  lines: PriceLine[];
  total: number;
  /** Must match BookingBar — same rupees the user saw. */
  cancellationNote?: string;
  /** Compact sheet variant: one struck row + "All fees and taxes included". */
  compact?: boolean;
  compactLabel?: string;
  /** Prior price the user actually saw, for strike-through. */
  wasTotal?: number;
};

/**
 * Every component of the price, named. Total must match the BookingBar.
 */
export function PriceBreakdown({
  lines,
  total,
  cancellationNote,
  compact,
  compactLabel,
  wasTotal,
}: PriceBreakdownProps) {
  if (compact) {
    return (
      <div className={styles.card} aria-live="polite">
        <div className={styles.row}>
          <span className={styles.muted}>{compactLabel ?? "Total"}</span>
          <span className={styles.value}>
            {wasTotal != null && wasTotal !== total && (
              <span className={styles.strike}>{formatPrice(wasTotal)} </span>
            )}
            {formatPrice(total)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.muted}>All fees and taxes included</span>
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} aria-live="polite">
      <dl className={styles.list}>
        {lines.map((line) => (
          <div
            key={line.id}
            className={[
              styles.row,
              line.tone === "discount" ? styles.discount : "",
              line.tone === "included" ? styles.included : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <dt className={styles.muted}>
              {line.label}
              {line.onExplain && (
                <button
                  type="button"
                  className={styles.q}
                  aria-label={line.explainLabel ?? `What is ${line.label}`}
                  onClick={line.onExplain}
                >
                  ?
                </button>
              )}
            </dt>
            <dd className={styles.value}>
              {line.display ??
                (line.amount != null
                  ? `${line.tone === "discount" ? "−" : ""}${formatPrice(Math.abs(line.amount))}`
                  : "")}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.hr} />
      <div className={styles.total}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatPrice(total)}</span>
      </div>
      {cancellationNote && <p className={styles.foot}>{cancellationNote}</p>}
    </div>
  );
}
