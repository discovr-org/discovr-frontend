"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { AppShell } from "@/shared/components/AppShell";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { UserIcon } from "@/shared/components/icons";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/profile/styles/profileScreen.module.css";

const noSubscribe = () => () => {};

export function ProfileScreen() {
  const saved = useSaved();
  const auth = useAuth();
  // The session lives in browser storage, so the server can't tell which view to draw.
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);

  if (!inBrowser) {
    return <AppShell current="profile" savedDot={saved.hasAny}>{null}</AppShell>;
  }

  if (!auth.user) {
    return (
      <AppShell current="profile" savedDot={saved.hasAny}>
        <div className={styles.page}>
          <h1 className={styles.title}>Account</h1>
          <EmptyState
            icon={<UserIcon />}
            title="Sign up to see your account"
            text="Your saved things and lists live here."
            action={
              <Button variant="primary" onClick={() => auth.openAuth("profile")}>
                Sign up
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell current="profile" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.lead} data-ph-mask>
            Signed in as {auth.user.phoneE164}
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

        <button
          type="button"
          className={styles.signOut}
          onClick={() => {
            void auth.signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
