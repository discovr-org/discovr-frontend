"use client";

import {
  useCallback,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./SegmentedControl.module.css";

export type Segment<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Disable the whole control. */
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * Two or three exclusive views of the same content (list / map).
 * Not for filters (use Chip) and not for screen nav (use TabBar).
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const listId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = useCallback(
    (e: KeyboardEvent, index: number) => {
      if (disabled) return;
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % segments.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        next = (index - 1 + segments.length) % segments.length;
      else return;
      e.preventDefault();
      const seg = segments[next];
      if (!seg) return;
      onChange(seg.value);
      refs.current[next]?.focus();
    },
    [disabled, onChange, segments],
  );

  return (
    <div
      className={`${styles.track} ${disabled ? styles.off : ""}`}
      role="tablist"
      aria-label={ariaLabel}
      id={listId}
    >
      {segments.map((seg, i) => {
        const selected = seg.value === value;
        return (
          <button
            key={seg.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            className={`${styles.seg} ${selected ? styles.on : ""}`}
            onClick={() => onChange(seg.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {seg.icon}
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
