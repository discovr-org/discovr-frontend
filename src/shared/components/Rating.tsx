import { Badge } from "./Badge";
import { StarIcon } from "./icons";
import styles from "./Rating.module.css";

export type RatingProps = {
  /** Average, unrounded beyond what you pass. Never invent precision. */
  value: number;
  /** Review count. Required — a bare average is not a rating. */
  count: number;
  /** Hide the count (inline score on a review row). */
  valueOnly?: boolean;
};

/**
 * One star + average + count. Under ten reviews still shows the count.
 * Zero reviews → NEW HOST badge.
 */
export function Rating({ value, count, valueOnly }: RatingProps) {
  if (count <= 0) {
    return <Badge>NEW HOST</Badge>;
  }

  const shown = Number.isInteger(value) ? String(value) : value.toFixed(1);
  const label = valueOnly
    ? `Rated ${shown} out of 5`
    : `Rated ${shown} out of 5 from ${count} reviews`;

  return (
    <span className={styles.rating} aria-label={label}>
      <StarIcon className={styles.star} />
      <span className={styles.value} aria-hidden="true">
        {shown}
      </span>
      {!valueOnly && (
        <span className={styles.count} aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}

export type RatingDistributionProps = {
  /** Counts for scores 5 → 1. */
  buckets: [number, number, number, number, number];
};

/** Five-bar honesty check on a detail screen. */
export function RatingDistribution({ buckets }: RatingDistributionProps) {
  const total = buckets.reduce((a, b) => a + b, 0) || 1;
  return (
    <ul className={styles.bars} aria-label="Rating distribution">
      {buckets.map((n, i) => {
        const score = 5 - i;
        const pct = Math.round((n / total) * 100);
        return (
          <li key={score} className={styles.brow}>
            <span className={styles.bn}>{score}</span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${pct}%` }} />
            </span>
            <span className={styles.bc}>{n}</span>
          </li>
        );
      })}
    </ul>
  );
}
