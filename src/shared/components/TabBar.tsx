"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { track } from "@/shared/analytics/utils/track";
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
  /** Guest gate for Profile — call preventDefault to open signup instead. */
  onProfile?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function TabBar({
  shown,
  current,
  onContact,
  savedDot,
  hrefs,
  onFocusWithin,
  onProfile,
}: TabBarProps) {
  const href = { explore: "/", saved: "/saved", profile: "/profile", ...hrefs };
  const aria = (t: Tab) => (t === current ? ("page" as const) : undefined);
  return (
    <nav className={`${styles.bar} ${shown ? styles.shown : ""}`} aria-label="Main" onFocus={onFocusWithin}>
      <div className={styles.row}>
        <Link
          href={href.explore}
          className={styles.item}
          aria-current={aria("explore")}
          data-attr="tab-explore"
          onClick={() => track("tab_clicked", { tab: "explore" })}
        >
          <CompassIcon />
          <span className={styles.label}>Explore</span>
        </Link>
        <button
          type="button"
          className={styles.item}
          aria-haspopup="dialog"
          data-attr="tab-contact"
          onClick={() => {
            track("tab_clicked", { tab: "contact" });
            onContact();
          }}
        >
          <MessageIcon />
          <span className={styles.label}>Contact us</span>
        </button>
        <Link
          href={href.saved}
          className={styles.item}
          aria-current={aria("saved")}
          data-attr="tab-saved"
          onClick={() => track("tab_clicked", { tab: "saved" })}
        >
          <HeartIcon />
          <span className={styles.label}>Saved</span>
          {savedDot && (
            <>
              <span className={styles.dot} aria-hidden="true" />
              <span className="vh">1 update</span>
            </>
          )}
        </Link>
        <Link
          href={href.profile}
          className={styles.item}
          aria-current={aria("profile")}
          data-attr="tab-profile"
          onClick={(e) => {
            track("tab_clicked", { tab: "profile" });
            onProfile?.(e);
          }}
        >
          <UserIcon />
          <span className={styles.label}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
