"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import styles from "./RequestBox.module.css";

export interface RequestBoxProps {
  /**
   * Called with the trimmed text when someone sends a request. Save it however your app
   * does (for example a `requests` table), together with what they were browsing:
   * the day, areas and times of day picked. Return a promise: while it's pending the
   * button says "Sending"; if it rejects, the text stays and an error line shows.
   */
  onSubmit: (text: string) => void | Promise<void>;
  /** Defaults to 140. */
  maxLength?: number;
}

/**
 * RequestBox: "Looking for something we don't have?" on the pink tint, with a one-line
 * field and Send. After sending it thanks them and offers "Send another request".
 * Explore only, once, at the very end of every list (and under the empty state).
 *
 * Keep it mounted while the filters change, so a half-typed request isn't lost.
 */
export function RequestBox({ onSubmit, maxLength = 140 }: RequestBoxProps) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const ids = useId();
  const headingId = `${ids}-h`;
  const inputId = `${ids}-input`;
  const helpId = `${ids}-help`;
  const errorId = `${ids}-error`;
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setFailed(false);
    try {
      await onSubmit(text);
      setDraft("");
      setSent(true);
      requestAnimationFrame(() => doneHeading.current?.focus());
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function again() {
    setSent(false);
    requestAnimationFrame(() => input.current?.focus());
  }

  if (sent) {
    return (
      <section className={styles.card} aria-labelledby={headingId}>
        <div className={styles.done} role="status">
          <span className={styles.icon} aria-hidden="true">
            <TickIcon />
          </span>
          <div className={styles.text}>
            <h2 className={styles.heading} id={headingId} ref={doneHeading} tabIndex={-1}>
              Thanks. We’ll go looking for it.
            </h2>
            <p className={styles.sub}>
              Want something else too?{" "}
              <button type="button" className={styles.again} onClick={again}>
                Send another request
              </button>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const empty = !draft.trim();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.top}>
          <span className={styles.icon} aria-hidden="true">
            <SparklesIcon />
          </span>
          <div className={styles.text}>
            <h2 className={styles.heading} id={headingId}>
              <label htmlFor={inputId}>Looking for something we don’t have?</label>
            </h2>
            <p className={styles.sub} id={helpId}>
              Tell us what you’d love to do in Goa. We read every one, and go looking for it.
            </p>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <input
              ref={input}
              id={inputId}
              name="request"
              type="text"
              maxLength={maxLength}
              autoComplete="off"
              enterKeyHint="send"
              aria-describedby={failed ? `${helpId} ${errorId}` : helpId}
              placeholder="Type your request"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (failed) setFailed(false);
              }}
            />
          </div>
          <button type="submit" className={styles.send} disabled={empty || sending} aria-busy={sending || undefined}>
            {sending ? "Sending" : "Send"}
          </button>
        </div>
        {failed && (
          <p className={styles.error} id={errorId} role="alert">
            That didn’t send. Check your connection and try again.
          </p>
        )}
      </form>
    </section>
  );
}

/* Lucide sparkles and check, inlined so this file needs nothing else. */
function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
