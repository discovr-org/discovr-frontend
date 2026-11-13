'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import styles from "@/features/trip/styles/tripEndPrompt.module.css";

/** What the person tapped. Save it before opening signup, so it is kept even if they skip signup. */
export type TripEndAnswer =
  /** A day in the next week. `lastDay` is their last day in Goa, "YYYY-MM-DD" in the device's time zone. `daysFromToday` is 0 for today. */
  | { kind: 'date'; lastDay: string; daysFromToday: number }
  /** Staying past the 7 days shown. `after` is the last day shown, "YYYY-MM-DD". Ask again once it passes. */
  | { kind: 'later'; after: string }
  /** "I live here". No trip end date. */
  | { kind: 'local' }
  /** "Not in Goa yet". Planning a trip. */
  | { kind: 'not_yet' };

export type TripEndPromptProps = {
  /** Show the prompt. It cannot be dismissed: set this to false from `onAnswer`. */
  open: boolean;
  /** Fires once, after the tapped option has shown as selected for `selectDelay` ms. */
  onAnswer: (answer: TripEndAnswer) => void;
  /** The day to count from. Defaults to the device's date when the prompt opens. */
  today?: Date;
  /** How long the tapped option stays highlighted before `onAnswer` fires. Default 240. */
  selectDelay?: number;
};

const OPEN_MS = 180;
const CLOSE_MS = 120;
const DAYS_SHOWN = 7;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Day = { key: string; iso: string; top: string; num: number; label: string; offset: number };

function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function buildDays(from: Date): Day[] {
  return Array.from({ length: DAYS_SHOWN }, (_, offset) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    const full = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    return {
      key: `day-${offset}`,
      iso: toIso(d),
      top: offset === 0 ? 'Today' : WEEKDAYS[d.getDay()],
      num: d.getDate(),
      label: offset === 0 ? `Today, ${full}` : full,
      offset,
    };
  });
}

export default function TripEndPrompt({
  open,
  onAnswer,
  today,
  selectDelay = 240,
}: TripEndPromptProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const bodyId = `${uid}-body`;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const answered = useRef(false);
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  const todayMs = today?.getTime();
  const days = useMemo(
    // Not built until the prompt opens, so the server render never reads the clock.
    () => (mounted ? buildDays(todayMs === undefined ? new Date() : new Date(todayMs)) : []),
    // Recomputed each time the prompt mounts, so the dates are right at the moment it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayMs, mounted],
  );
  const lastShown = days[days.length - 1];

  // ---------- open / close ----------
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      answered.current = false;
      setPicked(null);
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    clearTimeout(answerTimer.current);
    const t = setTimeout(() => {
      // Hand focus back only if nothing else (the AuthSheet, usually) has taken it meanwhile.
      const active = document.activeElement;
      if (!active || active === document.body || sheetRef.current?.contains(active)) {
        returnFocus.current?.focus?.();
      }
      setMounted(false);
    }, CLOSE_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => () => clearTimeout(answerTimer.current), []);

  // The page behind does not scroll. Released the moment `open` turns false, before a sheet
  // opened in the same update (the AuthSheet) takes its own lock.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus moves into the sheet on open.
  useEffect(() => {
    if (mounted && open) sheetRef.current?.focus({ preventScroll: true });
  }, [mounted, open]);

  if (!mounted) return null;

  const pick = (key: string, answer: TripEndAnswer) => {
    // The first tap wins, even if a second lands before the next paint.
    if (answered.current) return;
    answered.current = true;
    setPicked(key);
    clearTimeout(answerTimer.current);
    answerTimer.current = setTimeout(() => onAnswerRef.current(answer), selectDelay);
  };

  // Not dismissible: Escape does nothing, and Tab stays inside the sheet.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key !== 'Tab') return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const items = Array.from(sheet.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === sheet)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const locked = picked !== null;

  return createPortal(
    <div className={styles.root} data-visible={visible ? '' : undefined}>
      <div className={styles.scrim} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className={styles.head}>
          <p className={styles.overline}>One quick question</p>
          <h2 id={titleId} className={styles.title}>
            Till when are you in Goa?
          </h2>
          <p id={bodyId} className={styles.body}>
            So we can show you what’s worth doing before you go.
          </p>
        </div>

        <div className={styles.options} data-locked={locked ? '' : undefined}>
          <div className={styles.days}>
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                className={styles.tile}
                aria-label={d.label}
                aria-pressed={picked === d.key}
                onClick={() => pick(d.key, { kind: 'date', lastDay: d.iso, daysFromToday: d.offset })}
              >
                <span className={styles.tileTop}>{d.top}</span>
                <span className={styles.tileNum}>{d.num}</span>
              </button>
            ))}
            <button
              type="button"
              className={styles.tile}
              aria-label={`Later than ${lastShown.label}`}
              aria-pressed={picked === 'later'}
              onClick={() => pick('later', { kind: 'later', after: lastShown.iso })}
            >
              <span className={styles.tileLater}>Later</span>
            </button>
          </div>
          <div className={styles.others}>
            <button
              type="button"
              className={styles.pill}
              aria-pressed={picked === 'local'}
              onClick={() => pick('local', { kind: 'local' })}
            >
              I live here
            </button>
            <button
              type="button"
              className={styles.pill}
              aria-pressed={picked === 'not_yet'}
              onClick={() => pick('not_yet', { kind: 'not_yet' })}
            >
              Not in Goa yet
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
