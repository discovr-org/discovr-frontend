import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  width?: CSSProperties["width"];
  height: CSSProperties["height"];
  radius?: CSSProperties["borderRadius"];
  style?: CSSProperties;
}

/** A surface-sunken block at the exact size of the content it stands in for. */
export function Skeleton({ width = "100%", height, radius, style }: SkeletonProps) {
  return <div className={styles.skel} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

/** Loading state for the detail screen: gallery, title, key details, verdict and the four tiles. */
export function ExperienceDetailSkeleton({ summaryClassName }: { summaryClassName: string }) {
  return (
    <div aria-busy="true">
      <span className="vh">Loading experience</span>
      <div className={`${styles.skel} ${styles.hero}`} aria-hidden="true" />
      <div className={summaryClassName}>
        <div className={styles.stack}>
          <Skeleton height={32} />
          <Skeleton height={32} width="55%" />
          <Skeleton height={20} width="40%" style={{ marginTop: 4 }} />
        </div>
        <div className={styles.stack}>
          <Skeleton height={20} width="70%" />
          <Skeleton height={20} width="58%" />
          <Skeleton height={20} width="66%" />
          <Skeleton height={20} width="44%" />
        </div>
        <div className={styles.stack}>
          <Skeleton height={14} width="24%" />
          <Skeleton height={24} />
          <Skeleton height={24} width="62%" />
        </div>
        <div className={styles.tiles} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={68} radius="var(--radius-md)" />
          ))}
        </div>
      </div>
    </div>
  );
}
