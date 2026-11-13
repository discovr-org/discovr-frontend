"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { track } from "@/shared/analytics/utils/track";
// Trip-updates signup (hidden for now) also needs: useId, useState, FormEvent, subscribeTripUpdates.
import { DISCOVR_PHONE, DISCOVR_PHONE_DISPLAY } from "@/shared/utils/discovrContact";
import { MessageIcon, PhoneIcon } from "./icons";
import styles from "./SiteFooter.module.css";

/** One listener for every footer link: contact icons count as contact, the rest by their label. */
function onFooterClick(e: MouseEvent<HTMLElement>) {
  const a = (e.target as Element).closest("a");
  if (!a) return;
  const href = a.getAttribute("href") ?? "";
  const label = a.getAttribute("aria-label") || a.textContent?.trim() || href;
  const base = { cta_label: label, location: "footer" as const };
  if (href.startsWith("tel:")) track("contact_clicked", { ...base, channel: "call", cta: "call_us" });
  else if (href.startsWith("https://wa.me/")) {
    track("contact_clicked", { ...base, channel: "whatsapp", cta: "whatsapp_us" });
  } else track("footer_link_clicked", { ...base, cta: "footer_link", href });
}

type SiteFooterProps = {
  /** Where the signup came from, e.g. "home" or a listing slug. */
  source: string;
};

/** Page footer on home and listing pages: links, trip-updates signup, legal, wordmark. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by the hidden trip-updates signup
export function SiteFooter({ source }: SiteFooterProps) {
  /* Trip-updates signup: hidden for now, bring back with the section below.
  const id = useId();
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
      setError(err instanceof Error ? err.message : "That didn't go through. Try again.");
      setState("idle");
    }
  }
  */

  return (
    <footer className={styles.footer} onClick={onFooterClick}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.promise}>discovr the best of what Goa has to offer</p>
            <ul className={styles.icons} aria-label="Reach us">
              <li>
                <a
                  className={styles.icon}
                  href={`https://wa.me/${DISCOVR_PHONE.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp us"
                >
                  <MessageIcon />
                </a>
              </li>
              <li>
                <a
                  className={styles.icon}
                  href={`tel:${DISCOVR_PHONE}`}
                  aria-label={`Call us on ${DISCOVR_PHONE_DISPLAY}`}
                >
                  <PhoneIcon />
                </a>
              </li>
            </ul>
          </div>

          <nav className={styles.links} aria-label="Footer">
            <ul>
              <li><Link href="/saved">Saved</Link></li>
              <li><Link href="/goa-for-you">Things to do in Goa</Link></li>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/how-we-pick">How we pick</Link></li>
              <li><Link href="/list-with-us">List with us</Link></li>
              <li><Link href="/help">Help</Link></li>
            </ul>
          </nav>

          {/* Trip-updates signup: hidden for now, bring back later.
          <section className={styles.news} aria-labelledby={`${id}-h`}>
            <h2 id={`${id}-h`} className={styles.newsTitle}>
              Planning your Goa trip soon?
            </h2>
            <p className={styles.newsText}>
              Drop your WhatsApp number and we&apos;ll send you anything exciting that
              pops up.
            </p>
            {state === "done" ? (
              <p className={styles.newsDone} role="status">
                Done. We&apos;ll message you on WhatsApp.
              </p>
            ) : (
              <form className={styles.newsForm} noValidate onSubmit={onSubmit}>
                <label htmlFor={`${id}-phone`} className={styles.visuallyHidden}>
                  WhatsApp number
                </label>
                <div className={styles.newsField} data-error={Boolean(error)}>
                  <input
                    id={`${id}-phone`}
                    className={styles.newsInput}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    maxLength={20}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${id}-fine`}
                  />
                  <button
                    type="submit"
                    className={styles.newsButton}
                    aria-busy={state === "sending"}
                    disabled={state === "sending"}
                  >
                    Keep me posted
                  </button>
                </div>
                {error ? (
                  <p id={`${id}-fine`} className={styles.newsError} role="alert">
                    {error}
                  </p>
                ) : (
                  <p id={`${id}-fine`} className={styles.newsFine}>
                    On WhatsApp, only when something&apos;s worth it. Stop any time.
                  </p>
                )}
              </form>
            )}
          </section>
          */}
        </div>

        <div className={styles.bottom}>
          <span>© discovr 2026</span>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/disclaimer">Disclaimer</Link>
        </div>
        <div className={styles.mark} aria-hidden="true" />
      </div>
    </footer>
  );
}
