import { ChevronDownIcon } from "@/shared/components/icons";
import styles from "../styles/listingSections.module.css";

export type Faq = { q: string; a: string };

/** FAQs: tap a question to open its answer. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className={styles.faqs}>
      {faqs.map((f) => (
        <details key={`${f.q}-${f.a}`} className={styles.faq}>
          <summary>
            <span>{f.q}</span>
            <ChevronDownIcon />
          </summary>
          <p className={styles.faqAnswer}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
