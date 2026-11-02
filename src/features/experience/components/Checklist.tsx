import { CheckIcon } from "@/shared/components/icons";
import styles from "../styles/listingSections.module.css";

/** Things to get with you: one tick per item. */
export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className={styles.checklist}>
      {items.map((item) => (
        <li key={item} className={`${styles.tick} ${styles.yes}`}>
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
