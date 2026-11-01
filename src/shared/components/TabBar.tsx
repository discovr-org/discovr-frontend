"use client";

import Link from "next/link";
import { CompassIcon, HeartIcon, MessageIcon, UserIcon } from "./icons";
import styles from "./TabBar.module.css";

export type Tab = "explore" | "saved" | "profile";

export interface TabBarProps {
  shown: boolean;
  /** Which destination this screen belongs to. The detail screen belongs to Explore. */
  current: Tab;
  /** Opens the "Talk to us" sheet. Contact us is the one tab that is not a place. */
  onContact: () => void;
  /** Pink dot on Saved after something is saved. */
  savedDot?: boolean;
  hrefs?: Partial<Record<Tab, string>>;
  onFocusWithin?: () => void;
}

export function TabBar({ shown, current, onContact, savedDot, hrefs, onFocusWithin }: TabBarProps) {
  const href = { explore: "/", saved: "/saved", profile: "/profile", ...hrefs };
  const aria = (t: Tab) => (t === current ? ("page" as const) : undefined);
  return (
    <nav className={`${styles.bar} ${shown ? styles.shown : ""}`} aria-label="Primary" onFocus={onFocusWithin}>
      <div className={styles.row}>
        <Link href={href.explore} className={styles.item} aria-current={aria("explore")}>
          <CompassIcon />
          <span className={styles.label}>Explore</span>
        </Link>
        <button type="button" className={styles.item} aria-haspopup="dialog" onClick={onContact}>
          <MessageIcon />
          <span className={styles.label}>Contact us</span>
        </button>
        <Link href={href.saved} className={styles.item} aria-current={aria("saved")}>
          <HeartIcon />
          <span className={styles.label}>Saved</span>
          {savedDot && (
            <>
              <span className={styles.dot} aria-hidden="true" />
              <span className="vh">1 update</span>
            </>
          )}
        </Link>
        <Link href={href.profile} className={styles.item} aria-current={aria("profile")}>
          <UserIcon />
          <span className={styles.label}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
