"use client";

import { MinusIcon, PlusIcon } from "./icons";
import styles from "./Stepper.module.css";

export type StepperProps = {
  label: string;
  /** Age band or qualifier, e.g. "13 and over". */
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  /** Shown under the row at the ceiling, in state-notice. */
  maxHint?: string;
  /** Subject for aria-labels, e.g. "adult". */
  subject: string;
  onChange: (next: number) => void;
};

/** Guest / ticket count. Disable at floor and ceiling — never hide the buttons. */
export function Stepper({
  label,
  hint,
  value,
  min = 0,
  max = 10,
  maxHint,
  subject,
  onChange,
}: StepperProps) {
  const atFloor = value <= min;
  const atCeiling = value >= max;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.stack}>
          <span className={styles.label}>{label}</span>
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
        <div className={styles.control}>
          <button
            type="button"
            className={styles.btn}
            disabled={atFloor}
            aria-label={`One fewer ${subject}`}
            onClick={() => onChange(Math.max(min, value - 1))}
          >
            <MinusIcon />
          </button>
          <span className={styles.value} aria-live="polite">
            {value}
          </span>
          <button
            type="button"
            className={styles.btn}
            disabled={atCeiling}
            aria-label={`One more ${subject}`}
            onClick={() => onChange(Math.min(max, value + 1))}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
      {atCeiling && maxHint && <p className={styles.ceiling}>{maxHint}</p>}
    </div>
  );
}
