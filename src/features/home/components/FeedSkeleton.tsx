import styles from "@/features/home/styles/exploreFeed.module.css";
import { Skeleton } from "@/shared/components/Skeleton";

/** Same boxes as the real feed (title, portrait rail, landscape stack) so nothing jumps when data lands. */
export function FeedSkeleton() {
  return (
    <div aria-busy="true">
      <span className="vh">Loading tonight&apos;s picks</span>
      {[0, 1].map((s) => (
        <section key={s} className={styles.section} aria-hidden="true">
          <div style={{ padding: "0 var(--space-4)" }}>
            <Skeleton height={26} width="45%" />
          </div>
          {s === 0 ? (
            <div className={styles.rail}>
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  width="min(268px, 72vw)"
                  height="auto"
                  radius="var(--radius-lg)"
                  style={{ aspectRatio: "3 / 4", flex: "0 0 auto" }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.stack}>
              {[0, 1].map((i) => (
                <Skeleton key={i} height="auto" radius="var(--radius-md)" style={{ aspectRatio: "16 / 10" }} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
