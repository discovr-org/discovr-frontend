/**
 * Open / closed line for bars and restaurants from a free-text time slot.
 * Times are India time. Overnight ranges (9pm–3am) are fine.
 */

export type VenueHoursStatus = {
  open: boolean;
  status: string;
  /** Short range for the summary, e.g. "9pm – 3am". */
  hours: string;
};

/** Minutes after midnight for "7 PM", "9pm", "7:30pm", "1 AM". */
function parseClock(raw: string): number | null {
  const m = raw
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/p/i.test(m[3])) h += 12;
  return h * 60 + (m[2] ? Number(m[2]) : 0);
}

function formatClock(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return m ? `${h}:${String(m).padStart(2, "0")}${suffix}` : `${h}${suffix}`;
}

/**
 * Pull the first open–close pair from a sheet time slot.
 * "7 PM–1 AM." → 19:00–01:00; "9pm – 3am" same idea.
 */
export function parseTimeRange(
  timeSlot: string | undefined,
): { open: number; close: number; label: string } | null {
  if (!timeSlot?.trim()) return null;
  const cleaned = timeSlot.replace(/\.$/, "").trim();
  const range = cleaned.match(
    /(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\s*[–—-]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/i,
  );
  if (!range) return null;
  const open = parseClock(range[1]);
  const close = parseClock(range[2]);
  if (open == null || close == null) return null;
  return {
    open,
    close,
    label: `${formatClock(open)} – ${formatClock(close)}`,
  };
}

function minutesNowInZone(timeZone: string, now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function isOpenNow(open: number, close: number, nowMins: number): boolean {
  if (open === close) return true;
  if (close > open) return nowMins >= open && nowMins < close;
  // Overnight: open evening → close after midnight
  return nowMins >= open || nowMins < close;
}

/** "Open now · 9pm – 3am" / "Closed now · 9pm – 3am". */
export function venueHoursStatus(
  timeSlot: string | undefined,
  timeZone = "Asia/Kolkata",
  now: Date = new Date(),
): VenueHoursStatus | null {
  const range = parseTimeRange(timeSlot);
  if (!range) return null;
  const open = isOpenNow(
    range.open,
    range.close,
    minutesNowInZone(timeZone, now),
  );
  return {
    open,
    status: open ? "Open now" : "Closed now",
    hours: range.label,
  };
}
