'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import styles from "@/features/trip/styles/tripEndPrompt.module.css";

/** What the person tapped. Save it before signup opens, so it is kept even if they skip signup. */
export type TripEndAnswer =
  /** A day in the next week. `lastDay` is "YYYY-MM-DD" in the device's time zone. `daysFromToday` is 0 for today. */
  | { kind: 'date'; lastDay: string; daysFromToday: number }
  /** Staying past the 7 days shown. `after` is the last day shown, "YYYY-MM-DD". */
  | { kind: 'later'; after: string }
  /** "I live here". */
  | { kind: 'local' }
  /** "Not in Goa yet". */
  | { kind: 'not_yet' };

export type TripEndPromptProps = {
  /**
   * Show the prompt. Only the gift step is a hard wall. From the question step on, a tap outside the card
   * (or Escape) calls `onDismiss`, whether or not a day was tapped. Set `open` to false from `onAnswer` and `onDismiss`.
   */
  open: boolean;
  /** Fires once, `selectDelay` ms after the tap, so the person sees "Valid till" fill in first. */
  onAnswer: (answer: TripEndAnswer) => void;
  /** Optional: fires when the gift ticket is tapped, for analytics. */
  onReveal?: () => void;
  /**
   * Fires when the person taps outside the card (or presses Escape) on the question step.
   * `answer` is set when they had already tapped a day, so it can still be kept. `onAnswer` does not fire then.
   * Never fires on the gift step. Without it, the question step cannot be dismissed either.
   */
  onDismiss?: (answer?: TripEndAnswer) => void;
  /** The day to count from. Defaults to the device's date when the prompt opens. */
  today?: Date;
  /** From the tap on the ticket to the boarding pass. Default 3200 (the reels take 1800). */
  revealDelay?: number;
  /** From the tap on a day to `onAnswer`. Default 1100. */
  selectDelay?: number;
};

type Stage = 'gift' | 'pass';
type Picked = number | 'later' | 'local' | 'not_yet' | null;
type Day = { iso: string; top: string; num: number; full: string; label: string };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/*
 * The three slot-machine reels. Each starts on "?" and stops on its digit (3, 0, 0).
 * Every cell is 60px tall, so `end` is -(cells - 1) * 60. Staggered durations make them land left to right.
 */
const REELS: { cells: string; end: number; ms: number }[] = [
  { cells: '?52601815908301613', end: -1020, ms: 1100 },
  { cells: '?31860913909603082462810', end: -1380, ms: 1450 },
  { cells: '?94821935181909378657975432310', end: -1740, ms: 1800 },
];
// Sanity: each reel lands on its digit and `end` matches its length.
REELS.forEach((r) => {
  if (r.end !== -(r.cells.length - 1) * 60) throw new Error('TripEndPrompt: reel length and end disagree');
});

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDays(from: Date): Day[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const full = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    return {
      iso: toIso(d),
      top: i === 0 ? 'Today' : WEEKDAYS[d.getDay()],
      num: d.getDate(),
      full,
      label: i === 0 ? `Today, ${full}` : full,
    };
  });
}

const HandIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15" />
  </svg>
);

const PlaneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

export default function TripEndPrompt({
  open,
  onAnswer,
  onReveal,
  onDismiss,
  today,
  revealDelay = 3200,
  selectDelay = 1100,
}: TripEndPromptProps) {
  const uid = useId();
  const giftTitleId = `${uid}-gift-title`;
  const passTitleId = `${uid}-pass-title`;
  const passLiveId = `${uid}-pass-live`;

  const [stage, setStage] = useState<Stage>('gift');
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<Picked>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const answered = useRef(false);
  const pickedAnswer = useRef<TripEndAnswer | null>(null);
  const closed = useRef(false);
  const revealedRef = useRef(false);
  const onAnswerRef = useRef(onAnswer);
  const onDismissRef = useRef(onDismiss);
  // The timers read the latest callbacks, so a parent re-render never leaves them calling an old one.
  useEffect(() => {
    onAnswerRef.current = onAnswer;
    onDismissRef.current = onDismiss;
  });

  const todayMs = today?.getTime();
  const days = useMemo(
    // Read the clock only once it is open (never while the page is built), and again each time it opens,
    // so the dates are right at that moment.
    () => (open ? buildDays(todayMs === undefined ? new Date() : new Date(todayMs)) : []),
    [todayMs, open],
  );
  const last = days[days.length - 1];

  // Fresh start on every open.
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      answered.current = false;
      pickedAnswer.current = null;
      closed.current = false;
      revealedRef.current = false;
      setStage('gift');
      setRevealed(false);
      setPicked(null);
      return;
    }
    clearTimeout(revealTimer.current);
    clearTimeout(answerTimer.current);
    // Give focus back only if nothing else (the AuthSheet, usually) has taken it.
    const active = document.activeElement;
    if (!active || active === document.body) returnFocus.current?.focus?.();
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(revealTimer.current);
      clearTimeout(answerTimer.current);
    },
    [],
  );

  // The page behind does not scroll while the prompt is up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus moves into each sheet as it appears.
  useEffect(() => {
    if (open) sheetRef.current?.focus({ preventScroll: true });
  }, [open, stage]);

  if (!open || typeof document === 'undefined') return null;

  const reveal = () => {
    if (revealedRef.current) return; // the first tap wins
    revealedRef.current = true;
    setRevealed(true);
    onReveal?.();
    clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => setStage('pass'), revealDelay);
  };

  const pick = (key: Exclude<Picked, null>, answer: TripEndAnswer) => {
    if (answered.current) return; // the first tap wins
    answered.current = true;
    pickedAnswer.current = answer;
    setPicked(key);
    clearTimeout(answerTimer.current);
    answerTimer.current = setTimeout(() => onAnswerRef.current(answer), selectDelay);
  };

  // Quitting is allowed from the question step on, also after a day was tapped (the day is handed to onDismiss).
  // The gift step is the only hard wall.
  const canDismiss = stage === 'pass' && !!onDismiss;
  const dismiss = () => {
    if (stage !== 'pass' || closed.current) return;
    closed.current = true; // nothing else responds after quitting
    answered.current = true;
    clearTimeout(answerTimer.current); // a pending answer is handed to onDismiss instead of onAnswer
    onDismissRef.current?.(pickedAnswer.current ?? undefined);
  };

  // Escape quits where a tap outside would; otherwise it does nothing. Tab stays inside the sheet.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (canDismiss) dismiss();
      return;
    }
    if (e.key !== 'Tab') return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const items = Array.from(sheet.querySelectorAll<HTMLButtonElement>('button:not([aria-disabled="true"])'));
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const lastItem = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === sheet)) {
      e.preventDefault();
      lastItem.focus();
    } else if (!e.shiftKey && active === lastItem) {
      e.preventDefault();
      first.focus();
    }
  };

  let validTill = '';
  if (typeof picked === 'number') validTill = picked === 0 ? 'Today' : days[picked].full;
  else if (picked === 'later') validTill = `After ${last.full}`;
  else if (picked === 'local') validTill = 'Any day';
  else if (picked === 'not_yet') validTill = 'Your trip';

  const tileClass = (on: boolean) => `${styles.tile} ${on ? styles.on : ''}`;
  const pillClass = (on: boolean) => `${styles.pill} ${on ? styles.on : ''}`;

  return createPortal(
    <div className={styles.root}>
      {/* Gift step: a tap outside does nothing. Question step: a tap outside quits. */}
      <div
        className={`${styles.scrim} ${canDismiss ? styles.scrimTappable : ''}`}
        aria-hidden="true"
        onClick={canDismiss ? dismiss : undefined}
      />

      {stage === 'gift' ? (
        <div
          key="gift"
          ref={sheetRef}
          className={`${styles.sheet} ${styles.giftSheet}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={giftTitleId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <h2 id={giftTitleId} className={styles.giftTitle}>
            A gift for your Goa trip
          </h2>

          <button
            type="button"
            className={`${styles.ticket} ${revealed ? styles.bump : styles.wiggle}`}
            aria-label={
              revealed
                ? '₹300 off your first experience on discovr, valid till your last day'
                : 'Reveal your gift'
            }
            aria-disabled={revealed}
            onClick={reveal}
          >
            {!revealed && <span className={styles.shine} aria-hidden="true" />}

            <span className={styles.ticketMain} aria-live="polite">
              <span className={styles.amount}>
                <span className={styles.rupee}>₹</span>
                {revealed
                  ? REELS.map((r, i) => (
                      <span key={i} className={styles.slot} aria-hidden="true">
                        <span
                          className={styles.reel}
                          style={{ ['--end' as string]: `${r.end}px`, animationDuration: `${r.ms}ms` } as CSSProperties}
                        >
                          {r.cells.split('').map((c, j) => (
                            <span key={j} className={styles.cell}>
                              {c}
                            </span>
                          ))}
                        </span>
                      </span>
                    ))
                  : [0, 1, 2].map((i) => (
                      <span key={i} className={`${styles.slot} ${styles.slotHidden}`} aria-hidden="true">
                        ?
                      </span>
                    ))}
                {/* Always in the row, so nothing shifts when it fades in. */}
                <span className={`${styles.off} ${revealed ? styles.offIn : ''}`} aria-hidden="true">
                  off
                </span>
              </span>
              {/* Hidden, not removed, after the tap, so the ticket keeps its height. */}
              <span className={`${styles.hint} ${revealed ? styles.hintGone : ''}`} aria-hidden={revealed}>
                <HandIcon />
                Tap to reveal
              </span>
            </span>

            <span className={styles.vPerf} aria-hidden="true">
              <span className={`${styles.notch} ${styles.notchTop}`} />
              <span className={`${styles.notch} ${styles.notchBottom}`} />
            </span>

            <span className={styles.ticketStub}>
              <span className={styles.captionInk}>Valid till</span>
              <span className={styles.stubValue}>?</span>
            </span>
          </button>
        </div>
      ) : (
        <div
          key="pass"
          ref={sheetRef}
          className={`${styles.sheet} ${styles.passSheet}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={passTitleId}
          aria-describedby={passLiveId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <div className={styles.passWrap}>
            <div className={styles.pass}>
              <div className={styles.route}>
                <div className={styles.end}>
                  <div className={styles.captionInk}>From</div>
                  <div className={styles.city}>GOA</div>
                </div>
                <div className={styles.flight} aria-hidden="true">
                  <div className={styles.dash} />
                  <PlaneIcon />
                  <div className={styles.dash} />
                </div>
                <div className={`${styles.end} ${styles.endRight}`}>
                  <div className={styles.captionInk}>To</div>
                  <div className={styles.city}>HOME</div>
                </div>
              </div>

              <div id={passLiveId} className={styles.giftStub} aria-live="polite">
                <div className={`${styles.notch} ${styles.notchLeft}`} aria-hidden="true" />
                <div className={`${styles.notch} ${styles.notchRight}`} aria-hidden="true" />
                <div className={styles.stubCol}>
                  <div className={styles.captionInk}>Your gift</div>
                  <div className={styles.giftAmount}>₹300 off</div>
                </div>
                <div className={`${styles.stubCol} ${styles.stubColRight}`}>
                  <div className={styles.captionInk}>Valid till</div>
                  {picked === null ? (
                    <div className={styles.tillEmpty}>Your last day</div>
                  ) : (
                    <div className={`${styles.tillValue} ${styles.roll}`}>{validTill}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.passBody}>
            <h2 id={passTitleId} className={styles.passTitle}>
              Till when are you in Goa?
            </h2>
            <div className={`${styles.options} ${picked !== null ? styles.locked : ''}`}>
              <div className={styles.days}>
                {days.map((d, i) => (
                  <button
                    key={d.iso}
                    type="button"
                    className={tileClass(picked === i)}
                    aria-label={d.label}
                    aria-pressed={picked === i}
                    onClick={() => pick(i, { kind: 'date', lastDay: d.iso, daysFromToday: i })}
                  >
                    <span className={styles.tileTop}>{d.top}</span>
                    <span className={styles.tileNum}>{d.num}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={tileClass(picked === 'later')}
                  aria-label={`Later than ${last.full}`}
                  aria-pressed={picked === 'later'}
                  onClick={() => pick('later', { kind: 'later', after: last.iso })}
                >
                  <span className={styles.tileLater}>Later</span>
                </button>
              </div>
              <div className={styles.others}>
                <button
                  type="button"
                  className={pillClass(picked === 'local')}
                  aria-pressed={picked === 'local'}
                  onClick={() => pick('local', { kind: 'local' })}
                >
                  I live here
                </button>
                <button
                  type="button"
                  className={pillClass(picked === 'not_yet')}
                  aria-pressed={picked === 'not_yet'}
                  onClick={() => pick('not_yet', { kind: 'not_yet' })}
                >
                  Not in Goa yet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
