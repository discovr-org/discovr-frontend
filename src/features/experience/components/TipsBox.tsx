import styles from "../styles/listingSections.module.css";

/** Know before you go: a box of short tips. */
export function TipsBox({ tips }: { tips: string[] }) {
  return (
    <ul className={styles.tips}>
      {tips.map((tip) => (
        <li key={tip}>{tip}</li>
      ))}
    </ul>
  );
}
