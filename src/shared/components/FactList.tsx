import type { ReactNode } from "react";
import type { IncludedItem } from "@/types/experience";
import { CheckIcon, CrossIcon } from "./icons";
import styles from "./FactList.module.css";

export type Fact = {
  title: string;
  detail?: string;
  /** Sub-line colour when it states a state, e.g. a refund. */
  detailTone?: "positive";
  /** Decorative Lucide glyph; aria-hidden via the icon components. */
  icon: ReactNode;
};

export type FactListProps = {
  items: Fact[];
};

/** Raised card of short facts: icon, line, sub-line. Not interactive. */
export function FactList({ items }: FactListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.title} className={styles.fact}>
          {item.icon}
          <div className={styles.body}>
            <span className={styles.title}>{item.title}</span>
            {item.detail && (
              <span
                className={
                  item.detailTone === "positive"
                    ? `${styles.detail} ${styles.positive}`
                    : styles.detail
                }
              >
                {item.detail}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Map What's included rows onto FactList items (tick / cross). */
export function includedFacts(items: IncludedItem[]): Fact[] {
  return items.map((item) => ({
    title: item.title,
    detail: item.detail,
    detailTone: item.detailTone,
    icon: item.included ? <CheckIcon /> : <CrossIcon />,
  }));
}
