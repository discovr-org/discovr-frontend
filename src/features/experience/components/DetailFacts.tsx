import styles from "../styles/listingSections.module.css";

export type DetailFact = { label: string; value: string };

/** Details: label on the left, value on the right. Age, fitness level, ratio. */
export function DetailFacts({ facts }: { facts: DetailFact[] }) {
  return (
    <ul className={styles.facts}>
      {facts.map((f) => (
        <li key={f.label} className={styles.fact}>
          <span className={styles.factLabel}>{f.label}</span>
          <span className={styles.factValue}>{f.value}</span>
        </li>
      ))}
    </ul>
  );
}
