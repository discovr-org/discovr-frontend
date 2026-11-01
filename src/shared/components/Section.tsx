import { useId, type ReactNode } from "react";
import styles from "./Section.module.css";

export interface SectionProps {
  title: string;
  id?: string;
  children: ReactNode;
}

/** A long-form section: `title` heading, space-3 to its content. Sections sit space-6 apart. */
export function Section({ title, id, children }: SectionProps) {
  const headingId = useId();
  return (
    <section className={styles.section} id={id} aria-labelledby={headingId}>
      <h2 className="t-title" id={headingId}>
        {title}
      </h2>
      {children}
    </section>
  );
}
