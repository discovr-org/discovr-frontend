"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";
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
  const auth = useAuth();
  const router = useRouter();

  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      <TabBar
        shown
        current={current}
        savedDot={savedDot}
        onContact={() => setContactOpen(true)}
        onProfile={(e) => {
          if (auth.user) return;
          e.preventDefault();
          auth.requireAuth("profile", () => router.push("/profile"));
        }}
      />
      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
