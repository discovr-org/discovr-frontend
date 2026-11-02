import { useId } from "react";
import styles from "./Verdict.module.css";

export interface VerdictProps {
  /** One or two sentences, without quote marks (they are added). */
  text: string;
  /** Omit or empty for venues — quote only, no "Our verdict" overline. */
  label?: string | null;
}

export function Verdict({ text, label = "Our verdict" }: VerdictProps) {
  const id = useId();
  const showLabel = Boolean(label);
  return (
    <blockquote
      className={styles.verdict}
      aria-labelledby={showLabel ? id : undefined}
    >
      {showLabel ? (
        <span className={`t-caption ${styles.label}`} id={id}>
          {label}
        </span>
      ) : null}
      <p className={`t-body ${styles.quote}`}>{text}</p>
    </blockquote>
  );
}
