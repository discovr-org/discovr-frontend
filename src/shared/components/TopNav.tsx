"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { track } from "@/shared/analytics/utils/track";
import { CityPicker } from "./CityPicker";
import { UserIcon } from "./icons";
import type { Tab } from "./TabBar";
import styles from "./TopNav.module.css";

type TopNavProps = {
  current: Tab | "about";
  savedDot?: boolean;
  onContact: () => void;
  onProfile?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/** Desktop-only bar (≥1024px): wordmark + city, then the same destinations as the tab bar. */
export function TopNav({ current, savedDot, onContact, onProfile }: TopNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = (tab: TopNavProps["current"]) =>
    [styles.link, current === tab ? styles.active : ""].join(" ").trim();

  return (
    <nav
      className={styles.top}
      aria-label="Main"
      data-scrolled={scrolled}
      onClick={(e) => {
        const tab = (e.target as Element).closest<HTMLElement>("[data-tab]")?.dataset.tab;
        if (tab) track("tab_clicked", { tab });
      }}
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link className={styles.wordmark} href="/" aria-label="discovr, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/discovr-wordmark-bone.svg"
              alt="discovr"
              width={106}
              height={25}
              style={{ display: "block", width: 106, height: "auto" }}
            />
          </Link>
          <CityPicker open={cityOpen} onOpenChange={setCityOpen} />
        </div>
        <span className={styles.grow} />
        <ul className={styles.items}>
          <li>
            <Link data-tab="explore" className={link("explore")} href="/" aria-current={current === "explore" ? "page" : undefined}>
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <button type="button" data-tab="contact" className={`${styles.link} ${styles.linkButton}`} onClick={onContact}>
              <span>Contact us</span>
            </button>
          </li>
          <li>
            <Link data-tab="saved" className={link("saved")} href="/saved" aria-current={current === "saved" ? "page" : undefined}>
              <span>Saved</span>
              {savedDot ? <span className={styles.dot} aria-hidden="true" /> : null}
            </Link>
          </li>
          <li>
            <Link data-tab="about" className={link("about")} href="/about" aria-current={current === "about" ? "page" : undefined}>
              <span>About</span>
            </Link>
          </li>
        </ul>
        <Link
          data-tab="profile"
          className={styles.account}
          href="/profile"
          aria-label="Account"
          aria-current={current === "profile" ? "page" : undefined}
          onClick={onProfile}
        >
          <UserIcon />
        </Link>
      </div>
    </nav>
  );
}
