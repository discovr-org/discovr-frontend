"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { CheckIcon } from "./icons";
import styles from "./SelectionControl.module.css";

type RowBits = {
  label: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export type CheckboxProps = RowBits &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

/** Many-of-many. Whole 44px row is the target. */
export function Checkbox({ label, hint, disabled, className, id, ...rest }: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <label
      className={[styles.row, disabled ? styles.off : "", className].filter(Boolean).join(" ")}
      htmlFor={fieldId}
    >
      <span className={styles.box} data-checked={rest.checked || rest.defaultChecked ? "true" : undefined}>
        <input
          {...rest}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          className={styles.input}
        />
        <CheckIcon className={styles.tick} strokeWidth={3} />
      </span>
      <LabelStack label={label} hint={hint} />
    </label>
  );
}

export type RadioProps = RowBits &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

/** Exactly one of a small set. Share `name` inside a fieldset. */
export function Radio({ label, hint, disabled, className, id, ...rest }: RadioProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <label
      className={[styles.row, disabled ? styles.off : "", className].filter(Boolean).join(" ")}
      htmlFor={fieldId}
    >
      <span className={styles.dot} data-checked={rest.checked || rest.defaultChecked ? "true" : undefined}>
        <input
          {...rest}
          id={fieldId}
          type="radio"
          disabled={disabled}
          className={styles.input}
        />
      </span>
      <LabelStack label={label} hint={hint} />
    </label>
  );
}

export type ToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** Applies immediately. Control sits on the right. */
export function Toggle({ label, hint, checked, onChange, disabled, className }: ToggleProps) {
  return (
    <label className={[styles.row, styles.toggleRow, disabled ? styles.off : "", className].filter(Boolean).join(" ")}>
      <LabelStack label={label} hint={hint} grow />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
        onClick={() => onChange(!checked)}
      />
    </label>
  );
}

function LabelStack({
  label,
  hint,
  grow,
}: {
  label: string;
  hint?: string;
  grow?: boolean;
}) {
  return (
    <span className={`${styles.stack} ${grow ? styles.grow : ""}`}>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </span>
  );
}

export type RadioGroupProps = {
  legend: string;
  children: ReactNode;
  className?: string;
};

export function RadioGroup({ legend, children, className }: RadioGroupProps) {
  return (
    <fieldset className={[styles.group, className].filter(Boolean).join(" ")}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}
