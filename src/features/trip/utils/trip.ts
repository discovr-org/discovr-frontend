import type { TripEndAnswer } from "@/features/trip/components/TripEndPrompt";

/** What we keep about "Till when are you in Goa?". Days are "YYYY-MM-DD". Same shape the API returns. */
export type Trip = {
  status: "date" | "later" | "local" | "not_yet";
  lastDay: string | null;
  /** First day we may ask again. Null = never. */
  askAgainOn: string | null;
};

/** Days after their last day (or after answering) before we ask again. Same rule as the API. */
const ASK_AGAIN_AFTER_DAYS = 3;
const KEY = "discovr.trip";

export function isoDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function plusDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}

/** What the sheet's answer means for the API. */
export function tripFromAnswer(a: TripEndAnswer, today: string): Trip {
  if (a.kind === "date") return { status: "date", lastDay: a.lastDay, askAgainOn: plusDays(a.lastDay, ASK_AGAIN_AFTER_DAYS) };
  if (a.kind === "later") return { status: "later", lastDay: a.after, askAgainOn: plusDays(a.after, ASK_AGAIN_AFTER_DAYS) };
  if (a.kind === "local") return { status: "local", lastDay: null, askAgainOn: null };
  return { status: "not_yet", lastDay: null, askAgainOn: plusDays(today, ASK_AGAIN_AFTER_DAYS) };
}

/** Ask when we have no answer, or the day to ask again has come. */
export function shouldAsk(trip: Trip | null, today: string): boolean {
  return !trip || (trip.askAgainOn !== null && today >= trip.askAgainOn);
}

export function readLocalTrip(): Trip | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Trip | null;
    return v && typeof v.status === "string" ? v : null;
  } catch {
    return null;
  }
}

export function writeLocalTrip(trip: Trip): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(trip));
  } catch {
    // Private mode can refuse storage. The answer still goes to the API and PostHog.
  }
}
