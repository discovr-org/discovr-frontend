"use client";

import type { ReactNode } from "react";
import { useSaved } from "./SavedProvider";
import { AppShell } from "./AppShell";
import styles from "./InfoShell.module.css";

/** Chrome for text pages (About, How we pick, List with us, Help, legal): nav, gutters, footer. */
export function InfoShell({ children }: { children: ReactNode }) {
  const saved = useSaved();
  return (
    <AppShell current="about" savedDot={saved.hasAny}>
      <div className={styles.page}>{children}</div>
    </AppShell>
  );
}
