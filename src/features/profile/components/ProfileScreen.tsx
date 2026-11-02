"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { AppShell } from "@/shared/components/AppShell";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/profile/styles/profileScreen.module.css";

export function ProfileScreen() {
  const saved = useSaved();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user) auth.openAuth("profile");
    // Open once on first visit as a guest.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only gate on mount
  }, []);

  return (
    <AppShell current="profile" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.lead}>
            {auth.user
              ? `Signed in as ${auth.user.phoneE164}`
              : "You're browsing as a guest. Save or open Profile and we'll ask for your number."}
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
            <a href="/legal/terms">Terms &amp; conditions</a>
          </li>
          <li>
            <a href="/legal/privacy">Privacy</a>
          </li>
          <li>
            <a href="/help">Help</a>
          </li>
        </ul>

        {auth.user && (
          <button
            type="button"
            className={styles.signOut}
            onClick={() => {
              void auth.signOut();
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </AppShell>
  );
}
