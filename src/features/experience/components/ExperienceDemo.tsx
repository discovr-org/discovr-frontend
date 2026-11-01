"use client";

import { useState } from "react";
import { ExperienceDetail } from "@/features/experience/components/ExperienceDetail";
import {
  sampleListings,
  type SampleListing,
} from "@/features/experience/utils/sampleExperience";
import { ToastProvider } from "@/shared/components/Toast";
import type { ScreenState } from "@/types/experience";
import styles from "./ExperienceDemo.module.css";

const STATES: { id: ScreenState; label: string }[] = [
  { id: "populated", label: "Populated" },
  { id: "loading", label: "Loading" },
  { id: "offline", label: "Offline" },
  { id: "error", label: "Error" },
];

const LISTINGS: { id: SampleListing; label: string }[] = [
  { id: "kayak", label: "Night kayak" },
  { id: "thali", label: "Thali dinner, with menu" },
];

/** Demo only: desktop switcher for listings and screen states. Not product UI. */
export function ExperienceDemo({
  initialState,
  initialListing,
}: {
  initialState: ScreenState;
  initialListing: SampleListing;
}) {
  const [state, setState] = useState<ScreenState>(initialState);
  const [listing, setListing] = useState<SampleListing>(initialListing);

  const choose = (s: ScreenState) => {
    window.scrollTo(0, 0);
    setState(s);
  };

  return (
    <ToastProvider>
      <div
        className={styles.states}
        aria-label="Listing and screen state, for design review"
      >
        <span className={styles.label}>LISTING</span>
        <div className={styles.seg} role="tablist" aria-orientation="vertical">
          {LISTINGS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={listing === l.id}
              onClick={() => {
                window.scrollTo(0, 0);
                setListing(l.id);
                setState("populated");
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className={styles.label} style={{ marginTop: "var(--space-2)" }}>
          SCREEN STATE
        </span>
        <div className={styles.seg} role="tablist" aria-orientation="vertical">
          {STATES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={state === s.id}
              onClick={() => choose(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <ExperienceDetail
        experience={sampleListings[listing]}
        state={state}
        onRetry={() => choose("populated")}
      />
    </ToastProvider>
  );
}
