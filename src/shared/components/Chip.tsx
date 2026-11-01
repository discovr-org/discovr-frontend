"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./Chip.module.css";

export type ChipProps = {
  selected?: boolean;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Filter chip. Selected = brand-tint fill; default = line-strong border. */
export function Chip({ selected = false, children, className, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={[styles.chip, selected ? styles.selected : "", className ?? ""].join(" ").trim()}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  );
}
