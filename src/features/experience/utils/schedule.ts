import type { WeekSchedule, Weekday } from "@/types/experience";

/** The week always starts on Monday, whatever today is. */
export const WEEK: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Index of today in the Monday-first week, in the listing's timezone.
 * Experiences are in Goa, so "today" is India time even for a user whose phone says otherwise.
 * Server and client compute the same value, so there is no hydration mismatch.
 */
export function todayIndex(timeZone = "Asia/Kolkata", now: Date = new Date()): number {
  const short = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(now) as Weekday;
  const i = WEEK.indexOf(short);
  return i < 0 ? 0 : i;
}

/** "6:30pm and 8pm", "6:30pm, 8pm and 9:30pm" */
export function joinTimes(times: string[]): string {
  if (times.length <= 1) return times[0] ?? "";
  return `${times.slice(0, -1).join(", ")} and ${times[times.length - 1]}`;
}

/** Minutes after midnight for "6:30pm" / "11am". */
function minutes(t: string): number {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i.exec(t.trim());
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toLowerCase() === "pm") h += 12;
  return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
}

export type ScheduleSummary =
  | { kind: "today"; status: string; times: string }
  | { kind: "none"; status: string; next: string };

/**
 * The one-line summary under the clock icon.
 * Runs today: "Runs tonight · 6:30pm and 8pm" (or "Runs today" if any time is before 5pm).
 * Nothing today: "No trips today · next tomorrow 6:30pm" / "next Thu 6:30pm".
 */
export function summarise(schedule: WeekSchedule, today: number): ScheduleSummary {
  const times = schedule[WEEK[today]] ?? [];
  if (times.length) {
    const evening = times.every((t) => minutes(t) >= 17 * 60);
    return { kind: "today", status: evening ? "Runs tonight" : "Runs today", times: joinTimes(times) };
  }
  for (let n = 1; n <= 7; n++) {
    const day = WEEK[(today + n) % 7];
    const t = schedule[day];
    if (t && t.length) return { kind: "none", status: "No trips today", next: `next ${n === 1 ? "tomorrow" : day} ${t[0]}` };
  }
  return { kind: "none", status: "No trips this week", next: "" };
}

export function googleMapsPin(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function googleMapsDirections(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function rupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
