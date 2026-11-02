import type { ReactNode } from "react";
import styles from "../styles/legalPage.module.css";

export type LegalSection = { title: string; paragraphs: string[] };

type LegalPageProps = {
  title: string;
  sections: LegalSection[];
  children?: ReactNode;
};

export function LegalPage({ title, sections, children }: LegalPageProps) {
  return (
    <div className="app-shell">
      <article className={styles.prose}>
        <h1 className="display-md">{title}</h1>
        <p className={styles.review} role="note">
          Draft wording. A lawyer reviews this page before launch.
        </p>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
        {children}
      </article>
    </div>
  );
}

export function LegalSectionBlock({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
