"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { DISCOVR_PHONE } from "@/shared/utils/discovrContact";
import { subscribeTripUpdates } from "@/shared/utils/tripUpdatesApi";
import { Button } from "./Button";
import { MessageIcon, PhoneIcon } from "./icons";
import { Input } from "./Input";
import styles from "./SiteFooter.module.css";

type SiteFooterProps = {
  /** Where the signup came from, e.g. "home" or a listing slug. */
  source: string;
};

/** Page footer on home and listing pages: links, trip-updates signup, legal, wordmark. */
export function SiteFooter({ source }: SiteFooterProps) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string>();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setState("sending");
    try {
      await subscribeTripUpdates(phone, source);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : undefined);
      setState("idle");
    }
  }

  return (
    <footer className={styles.footer}>
      <h2 className={styles.title}>discovr the best of what Goa has to offer</h2>
      <div className={styles.actions}>
        <a
          className={styles.circle}
          href={`https://wa.me/${DISCOVR_PHONE.replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp us"
        >
          <MessageIcon />
        </a>
        <a className={styles.circle} href={`tel:${DISCOVR_PHONE}`} aria-label="Call us">
          <PhoneIcon />
        </a>
      </div>
      <nav className={styles.links} aria-label="More from discovr">
        <Link href="/saved">Saved</Link>
        <Link href="/about">About us</Link>
        <Link href="/how-we-pick">How we pick</Link>
        <Link href="/list-with-us">List with us</Link>
        <Link href="/help">Help</Link>
      </nav>

      <form className={styles.signup} onSubmit={onSubmit}>
        <h3 className={styles.signupTitle}>Planning your Goa trip soon?</h3>
        <p className={styles.signupText}>
          Drop your WhatsApp number and we&apos;ll send you anything exciting that
          pops up.
        </p>
        {state === "done" ? (
          <p className={styles.signupDone} role="status">
            Done. We&apos;ll message you on WhatsApp.
          </p>
        ) : (
          <>
            <Input
              label="WhatsApp number"
              hideLabel
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98765 43210"
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
              required
            />
            <Button variant="secondary" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Keep me posted"}
            </Button>
            <p className={styles.signupFine}>
              On WhatsApp, only when something&apos;s worth it. Stop any time.
            </p>
          </>
        )}
      </form>

      <p className={styles.legal}>
        <span>© discovr 2026</span>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/disclaimer">Disclaimer</Link>
      </p>
      <p className={styles.wordmark} aria-hidden="true">
        discovr
      </p>
    </footer>
  );
}
