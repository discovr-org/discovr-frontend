import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Required: an icon alone is never a label. */
  label: string;
  /** Put a scrim behind it when it sits on a photo. */
  scrimmed?: boolean;
  /** For toggles such as save. Sets aria-pressed and the filled-pink state. */
  pressed?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function IconButton({ label, scrimmed, pressed, className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      className={[styles.button, scrimmed ? styles.scrimmed : "", className ?? ""].join(" ").trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
