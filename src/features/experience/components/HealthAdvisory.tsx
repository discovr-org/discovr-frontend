import { AlertIcon } from "@/shared/components/icons";
import styles from "../styles/listingSections.module.css";

/** The one yellow box on the page. */
export function HealthAdvisory({ text }: { text: string }) {
  return (
    <aside className={styles.advisory} aria-label="Health advisory">
      <AlertIcon />
      <div>
        <p className={styles.advisoryTitle}>Health advisory</p>
        <p className={styles.advisoryText}>{text}</p>
      </div>
    </aside>
  );
}
