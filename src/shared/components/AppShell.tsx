"use client";

import { useState, type ReactNode } from "react";
import { ContactSheet } from "./ContactSheet";
import { TabBar, type Tab } from "./TabBar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  current: Tab;
  children: ReactNode;
  savedDot?: boolean;
};

/** Top-level screen chrome: content column + TabBar + Contact us sheet. */
export function AppShell({ current, children, savedDot }: AppShellProps) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      <TabBar
        shown
        current={current}
        savedDot={savedDot}
        onContact={() => setContactOpen(true)}
      />
      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
