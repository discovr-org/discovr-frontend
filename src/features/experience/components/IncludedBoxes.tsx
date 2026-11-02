import { CheckIcon, CrossIcon } from "@/shared/components/icons";
import type { IncludedItem } from "@/types/experience";
import styles from "../styles/listingSections.module.css";

/** "Not included: towels" reads twice under a "What's not included" heading. */
function cleanTitle(title: string): string {
  const text = title.replace(/^(not\s+)?included:\s*/i, "").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** What's included (ticks) and what's not (crosses), side by side. */
export function IncludedBoxes({ items }: { items: IncludedItem[] }) {
  const yes = items.filter((i) => i.included);
  const no = items.filter((i) => !i.included);
  return (
    <div className={styles.boxes}>
      {yes.length > 0 ? (
        <section className={styles.box} aria-label="What's included">
          <h3 className={styles.boxTitle}>What&apos;s included</h3>
          <ul className={styles.ticks}>
            {yes.map((i) => (
              <li key={i.title} className={`${styles.tick} ${styles.yes}`}>
                <CheckIcon />
                <span>{cleanTitle(i.title)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {no.length > 0 ? (
        <section className={styles.box} aria-label="What's not included">
          <h3 className={styles.boxTitle}>What&apos;s not included</h3>
          <ul className={styles.ticks}>
            {no.map((i) => (
              <li key={i.title} className={styles.tick}>
                <CrossIcon />
                <span>{cleanTitle(i.title)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
