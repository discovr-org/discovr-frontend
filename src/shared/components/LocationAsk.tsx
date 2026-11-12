"use client";

import { useEffect } from "react";
import { useLocationAsk } from "@/shared/utils/useLocationAsk";
import { Button } from "./Button";
import styles from "./LocationAsk.module.css";

/**
 * Sits above the tab bar after the first real scroll.
 * Not a dialog: the site works the same if they dismiss it.
 * The button is secondary so the screen keeps its one bone action.
 */
export function LocationAsk() {
  const { phase, allow, dismiss } = useLocationAsk();
  const open = phase === "ask" || phase === "locating" || phase === "error";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const locating = phase === "locating";
  const missed = phase === "error";

  return (
    <section className={styles.bar} aria-label="Location" aria-live="polite" aria-busy={locating}>
      <div>
        <p className={styles.title}>Where are you?</p>
        <p className={styles.text}>
          {missed
            ? "Couldn't get a location. Try again."
            : "Your browser hides the real area. Allow it and we use the real spot."}
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          className={styles.allow}
          disabled={locating}
          onClick={allow}
        >
          {locating ? "Finding you" : "Allow location"}
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </section>
  );
}
