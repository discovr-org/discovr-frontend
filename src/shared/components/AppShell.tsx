"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { ContactSheet } from "./ContactSheet";
import { TabBar, type Tab } from "./TabBar";
import { TopNav } from "./TopNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  current: Tab | "about";
  children: ReactNode;
  savedDot?: boolean;
};

/** Screen chrome: skip link, phone tab bar, desktop top bar, Contact us sheet, centred column. */
export function AppShell({ current, children, savedDot }: AppShellProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const onProfile = (e: MouseEvent<HTMLAnchorElement>) => {
    if (auth.user) return;
    e.preventDefault();
    auth.requireAuth("profile", () => router.push("/profile"));
  };

  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <TabBar
        shown
        current={current === "about" ? "explore" : current}
        savedDot={savedDot}
        onContact={() => setContactOpen(true)}
        onProfile={onProfile}
      />
      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
      <TopNav
        current={current}
        savedDot={savedDot}
        onContact={() => setContactOpen(true)}
        onProfile={onProfile}
      />
      <div className={styles.shell}>
        <main id="main" tabIndex={-1} className={styles.main}>
          {children}
        </main>
      </div>
    </>
  );
}
