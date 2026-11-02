import { useId, type ReactNode } from "react";
import styles from "./Section.module.css";

export interface SectionProps {
  /** Omit to render content with no heading (e.g. included facts). */
  title?: string;
  id?: string;
  children: ReactNode;
}

/** A long-form section: optional `title` heading, space-3 to its content. */
export function Section({ title, id, children }: SectionProps) {
  const headingId = useId();
  return (
    <section
      className={styles.section}
      id={id}
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : id}
    >
      {title ? (
        <h2 className="t-title" id={headingId}>
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
