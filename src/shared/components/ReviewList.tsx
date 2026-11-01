import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Rating, RatingDistribution } from "./Rating";
import styles from "./ReviewList.module.css";

export type Review = {
  id: string;
  /** First name only. */
  name: string;
  /** When + who they came with, e.g. "Last week · came solo". */
  context: string;
  /** Integer 1–5. */
  score: number;
  body: string;
  avatarSrc?: string;
};

export type ReviewListProps = {
  reviews: Review[];
  average: number;
  totalCount: number;
  distribution: [number, number, number, number, number];
  onSeeAll?: () => void;
};

/**
 * Most recent two reviews on a detail screen, then "See all N reviews".
 * No cards — rules on the canvas.
 */
export function ReviewList({
  reviews,
  average,
  totalCount,
  distribution,
  onSeeAll,
}: ReviewListProps) {
  const shown = reviews.slice(0, 2);

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className={styles.head}>
        <h2 id="reviews-heading" className={styles.title}>
          Reviews
        </h2>
        <Rating value={average} count={totalCount} />
      </div>

      <RatingDistribution buckets={distribution} />

      <ul className={styles.list}>
        {shown.map((r) => (
          <li key={r.id} className={styles.item}>
            <div className={styles.rh}>
              <Avatar name={r.name} src={r.avatarSrc} size="sm" />
              <div className={styles.who}>
                <span className={styles.name}>{r.name}</span>
                <span className={styles.context}>{r.context}</span>
              </div>
              <Rating value={r.score} count={1} valueOnly />
            </div>
            <p className={styles.body}>{r.body}</p>
          </li>
        ))}
      </ul>

      {totalCount > shown.length && (
        <Button variant="secondary" onClick={onSeeAll} type="button">
          See all {totalCount} reviews
        </Button>
      )}
    </section>
  );
}
