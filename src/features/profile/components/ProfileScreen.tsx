"use client";

import { AppShell } from "@/shared/components/AppShell";
import { readSession, clearSession } from "@/features/auth/utils/session";
import { useSaved } from "@/shared/utils/useSaved";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/features/auth/utils/session";
import styles from "@/features/profile/styles/profileScreen.module.css";

export function ProfileScreen() {
  const saved = useSaved();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(readSession());
  }, []);

  return (
    <AppShell current="profile" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.lead}>
            {user
              ? `Signed in as ${user.phoneE164}`
              : "You're browsing as a guest. Save or call to book and we'll ask for your number."}
          </p>
        </header>

        <ul className={styles.list}>
          <li>
            <a href="/saved">Saved ({saved.slugs.length})</a>
          </li>
          <li>
            <a href="/about">About us</a>
          </li>
          <li>
            <a href="/how-we-pick">How we pick</a>
          </li>
          <li>
            <a href="/list-with-us">List with us</a>
          </li>
          <li>
            <a href="/terms">Terms &amp; conditions</a>
          </li>
          <li>
            <a href="/privacy">Privacy</a>
          </li>
          <li>
            <a href="/help">Help</a>
          </li>
        </ul>

        {user && (
          <button
            type="button"
            className={styles.signOut}
            onClick={() => {
              clearSession();
              setUser(null);
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </AppShell>
  );
}
