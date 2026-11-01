import type { ReactNode } from "react";
import styles from "./Banner.module.css";

export interface BannerProps {
  tone?: "notice" | "critical";
  icon: ReactNode;
  title: string;
  text?: string;
}

/** An ongoing condition (offline, weather). Stays until the condition ends. */
export function Banner({ tone = "notice", icon, title, text }: BannerProps) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="status">
      <span className={styles.icon}>{icon}</span>
      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        {text && <span className={styles.text}>{text}</span>}
      </div>
    </div>
  );
}
