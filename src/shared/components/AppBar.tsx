"use client";

import { forwardRef } from "react";
import { IconButton } from "./IconButton";
import { BackIcon, HeartIcon, ShareIcon } from "./icons";
import styles from "./AppBar.module.css";

export interface AppBarProps {
  /** Shown in the bar only once it is solid (past the gallery). */
  title: string;
  /** false over the gallery (transparent, scrimmed controls), true once past it. */
  solid: boolean;
  /** Slid up out of view while scrolling down past the gallery. */
  hidden: boolean;
  saved: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onFocusWithin?: () => void;
}

/** Back on the left, the experience title in the middle, share then save on the right. */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  { title, solid, hidden, saved, onBack, onShare, onToggleSave, onFocusWithin },
  ref,
) {
  const scrimmed = !solid;
  return (
    <header
      ref={ref}
      className={[styles.bar, solid ? styles.solid : "", hidden ? styles.hidden : ""].join(" ").trim()}
      onFocus={onFocusWithin}
    >
      <IconButton label="Back" scrimmed={scrimmed} onClick={onBack}>
        <BackIcon />
      </IconButton>
      <span className={styles.title} aria-hidden="true">
        {title}
      </span>
      <IconButton label="Share this experience" scrimmed={scrimmed} onClick={onShare}>
        <ShareIcon />
      </IconButton>
      <IconButton
        label={saved ? "Remove from saved" : "Save this experience"}
        scrimmed={scrimmed}
        pressed={saved}
        onClick={onToggleSave}
      >
        <HeartIcon />
      </IconButton>
    </header>
  );
});
