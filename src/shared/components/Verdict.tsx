import { useId } from "react";
import styles from "./Verdict.module.css";

export interface VerdictProps {
  /** One or two sentences, without quote marks (they are added). */
  text: string;
  label?: string;
}

export function Verdict({ text, label = "Our verdict" }: VerdictProps) {
  const id = useId();
  return (
    <blockquote className={styles.verdict} aria-labelledby={id}>
      <span className={`t-caption ${styles.label}`} id={id}>
        {label}
      </span>
      <p className={`t-body ${styles.quote}`}>{text}</p>
    </blockquote>
  );
}
