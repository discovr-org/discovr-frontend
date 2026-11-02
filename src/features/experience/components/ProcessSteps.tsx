import styles from "../styles/listingSections.module.css";

export interface ProcessStepsProps {
  hostName: string;
  area: string;
}

/** The process: find it, call and book, show up. */
export function ProcessSteps({ hostName, area }: ProcessStepsProps) {
  const steps = [
    { title: "Find it", text: "You're here. Save it or send it to your group." },
    { title: "Call and book", text: `Call ${hostName} and pick your slot.` },
    { title: "Show up", text: `Get to ${area} a little before your slot.` },
  ];
  return (
    <ol className={styles.steps}>
      {steps.map((s, i) => (
        <li key={s.title} className={styles.step}>
          <span className={styles.stepNumber} aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <p className={styles.stepTitle}>{s.title}</p>
            <p className={styles.stepText}>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
