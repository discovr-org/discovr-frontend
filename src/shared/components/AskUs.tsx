import { discovrWhatsApp } from "@/shared/utils/discovrContact";
import styles from "./AskUs.module.css";

export interface AskUsProps {
  /** The message typed into WhatsApp before they send it. */
  message?: string;
  /** Defaults to "Have any questions?" */
  title?: string;
  /** Defaults to "Ask us. We get back instantly." */
  subtitle?: string;
}

/**
 * AskUs: a green row that opens a WhatsApp chat with discovr, message prefilled.
 * Always discovr's number, never the host's.
 */
export function AskUs({
  message = "Hi discovr, I have a question.",
  title = "Have any questions?",
  subtitle = "Ask us. We get back instantly.",
}: AskUsProps) {
  return (
    <a className={styles.row} href={discovrWhatsApp(message)} target="_blank" rel="noopener">
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
      <span className={styles.vh}>Opens WhatsApp</span>
      <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </a>
  );
}
