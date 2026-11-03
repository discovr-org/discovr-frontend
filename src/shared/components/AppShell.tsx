"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/shared/analytics/utils/track";
import { ContactSheet } from "./ContactSheet";
import { SiteFooter } from "./SiteFooter";
import { TabBar, type Tab } from "./TabBar";
import { TopNav } from "./TopNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  current: Tab | "about";
  children: ReactNode;
  savedDot?: boolean;
  /** Hide the footer, e.g. while a listing is still loading. */
  footer?: boolean;
  /** Where a footer trip-updates signup came from. Defaults to the path. */
  footerSource?: string;
};

/** Screen chrome: skip link, phone tab bar, desktop top bar, Contact us sheet, centred column, footer. */
export function AppShell({ current, children, savedDot, footer = true, footerSource }: AppShellProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const pathname = usePathname();
  const openContact = () => {
    track("contact_sheet_opened", {});
    setContactOpen(true);
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
        onContact={openContact}
      />
      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
      <TopNav
        current={current}
        savedDot={savedDot}
        onContact={openContact}
      />
      <div className={styles.shell}>
        <main id="main" tabIndex={-1} className={styles.main}>
          {children}
          {footer ? <SiteFooter source={footerSource ?? (pathname === "/" ? "home" : pathname)} /> : null}
        </main>
      </div>
    </>
  );
}
