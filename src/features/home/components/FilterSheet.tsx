"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Chip } from "@/shared/components/Chip";
import { PanelSheet } from "@/shared/components/PanelSheet";
import {
  DURATION_OPTIONS,
  NO_FILTERS,
  PRICE_OPTIONS,
  TYPE_OPTIONS,
  WHEN_OPTIONS,
  type FeedFilters,
} from "@/features/home/utils/feedFilters";
import styles from "@/features/home/styles/filterSheet.module.css";

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  areas: string[];
  value: FeedFilters;
  onApply: (next: FeedFilters) => void;
  /** Live count for the draft, read out to screen readers. */
  countFor: (draft: FeedFilters) => number;
};

const toggle = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export function FilterSheet({ open, onClose, areas, value, onApply, countFor }: FilterSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const count = countFor(draft);

  return (
    <PanelSheet
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={() => setDraft(NO_FILTERS)}>
            Clear
          </Button>
          <Button
            narrow
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show results
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <p className="vh" role="status">
          {open ? `${count} ${count === 1 ? "result" : "results"}` : ""}
        </p>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Area</legend>
          <div className={styles.chips}>
            {areas.map((a) => (
              <Chip
                key={a}
                selected={draft.areas.includes(a)}
                onClick={() => setDraft({ ...draft, areas: toggle(draft.areas, a) })}
              >
                {a}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>When</legend>
          <div className={styles.chips}>
            {WHEN_OPTIONS.map((w) => (
              <Chip
                key={w}
                selected={draft.when === w}
                onClick={() => setDraft({ ...draft, when: draft.when === w ? null : w })}
              >
                {w}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Price</legend>
          <div className={styles.chips}>
            {PRICE_OPTIONS.map((p) => (
              <Chip
                key={p}
                selected={draft.price === p}
                onClick={() => setDraft({ ...draft, price: draft.price === p ? null : p })}
              >
                {p}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>How long</legend>
          <div className={styles.chips}>
            {DURATION_OPTIONS.map((d) => (
              <Chip
                key={d}
                selected={draft.duration === d}
                onClick={() => setDraft({ ...draft, duration: draft.duration === d ? null : d })}
              >
                {d}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Type</legend>
          <div className={styles.chips}>
            {TYPE_OPTIONS.map((t) => (
              <Chip
                key={t}
                selected={draft.types.includes(t)}
                onClick={() => setDraft({ ...draft, types: toggle(draft.types, t) })}
              >
                {t}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
    </PanelSheet>
  );
}
