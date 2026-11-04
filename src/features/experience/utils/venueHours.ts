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
  const cleaned = timeSlot
    .replace(/\.$/, "")
    .replace(/\bmidnight\b/gi, "12 AM")
    .replace(/\bnoon\b/gi, "12 PM")
    .trim();
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

const EVERY_DAY = /every\s*day|daily|all\s*week|7\s*days|nightly/i;
const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** "8 AM and 10 AM (2 slots)" → "8am and 10am". */
export function tidyTimes(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, "")
    .replace(/\.$/, "")
    .replace(/(\d)\s*([ap])\.?m\.?/gi, (_, d: string, ap: string) => `${d}${ap.toLowerCase()}m`)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trips with slots rather than an open–close range:
 * "Every day" + "8 AM and 10 AM" → "Open today · 8am and 10am".
 * "Tuesdays off." on a Tuesday → "Closed today".
 */
export function openTodayStatus(
  days: string | undefined,
  timeSlot: string | undefined,
  timeZone = "Asia/Kolkata",
  now: Date = new Date(),
): VenueHoursStatus | null {
  const times = timeSlot ? tidyTimes(timeSlot) : "";
  const dayText = (days ?? "").toLowerCase();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone })
    .format(now)
    .toLowerCase();
  if (WEEKDAY_NAMES.includes(today) && dayIsOff(dayText, today)) {
    return { open: false, status: "Closed today", hours: times };
  }
  if (!dayText || EVERY_DAY.test(dayText) || /off|closed/.test(dayText) || dayText.includes(today)) {
    if (!times) return null;
    return { open: true, status: "Open today", hours: times };
  }
  return null;
}

/**
 * Mon → Sun rows from free-text days and a slot/range: "Every day" + "8 AM and 10 AM"
 * → seven rows of "8am, 10am". `null` marks a day off. Empty when there are no times.
 */
export function weekFromHours(
  days: string | undefined,
  timeSlot: string | undefined,
): Array<string | null> {
  const range = parseTimeRange(timeSlot);
  const times = range ? range.label : timeSlot ? tidyTimes(timeSlot).replace(/\s+and\s+/g, ", ") : "";
  if (!times) return [];
  const dayText = (days ?? "").toLowerCase();
  // WEEKDAY_NAMES starts on Sunday; the rows start on Monday.
  const names = [...WEEKDAY_NAMES.slice(1), WEEKDAY_NAMES[0]];
  const named = names.filter((d) => dayText.includes(d) || dayText.includes(d.slice(0, 3)));
  return names.map((d) => {
    if (dayIsOff(dayText, d)) return null;
    if (!dayText || EVERY_DAY.test(dayText) || /off|closed/.test(dayText) || !named.length) return times;
    return named.includes(d) ? times : null;
  });
}

/** "Tuesdays off", "Tue off", "Closed Tuesday.", "Closed on Mon and Tue". */
function dayIsOff(dayText: string, day: string): boolean {
  const short = day.slice(0, 3);
  if (new RegExp(`(${day}|${short})s?\\s+off`).test(dayText)) return true;
  const closed = dayText.match(/closed\s+(?:on\s+)?([a-z,\s&]+)/);
  return Boolean(closed && new RegExp(`\\b${short}`).test(closed[1]));
}

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type HoursInput = {
  days?: string;
  timeSlot?: string;
  altDays?: string[];
  altTimeSlot?: string;
  closedDays?: string[];
};

function slotFor(hours: HoursInput, day: string): string | undefined {
  const alt = hours.altTimeSlot?.trim();
  return alt && hours.altDays?.includes(day) ? alt : hours.timeSlot;
}

/**
 * Today's line, honouring picked closed days and other-hours days before the free text.
 * `preferRange` tries an open–close range first (places), else slots first (trips).
 */
export function todayStatus(
  hours: HoursInput,
  preferRange: boolean,
  timeZone = "Asia/Kolkata",
  now: Date = new Date(),
): VenueHoursStatus | null {
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(now);
  const todayLong = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(now).toLowerCase();
  if (hours.closedDays?.includes(today) || dayIsOff((hours.days ?? "").toLowerCase(), todayLong)) {
    return { open: false, status: "Closed today", hours: "" };
  }
  const slot = slotFor(hours, today);
  const range = venueHoursStatus(slot, timeZone, now);
  const slots = openTodayStatus(hours.days, slot, timeZone, now);
  return preferRange ? (range ?? slots) : (slots ?? range);
}

/** Mon → Sun rows, with picked closed days and other-hours days applied. */
export function weekRows(hours: HoursInput): Array<string | null> {
  const base = weekFromHours(hours.days, hours.timeSlot);
  const alt = hours.altTimeSlot?.trim() ? weekFromHours(undefined, hours.altTimeSlot) : [];
  const order = [...SHORT_DAYS.slice(1), SHORT_DAYS[0]];
  if (!base.length && !alt.length) return [];
  return order.map((d, i) => {
    if (hours.closedDays?.includes(d)) return null;
    if (alt.length && hours.altDays?.includes(d)) return alt[i];
    return base.length ? base[i] : null;
  });
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
