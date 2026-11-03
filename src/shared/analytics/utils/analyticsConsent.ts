const KEY = "discovr-analytics-off";
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

/** Analytics is on unless the visitor turned it off on this device in the last 12 months. */
export function isAnalyticsOn(): boolean {
  if (typeof window === "undefined") return true;
  const offAt = Number(window.localStorage.getItem(KEY));
  if (!offAt) return true;
  if (Date.now() - offAt > TWELVE_MONTHS_MS) {
    window.localStorage.removeItem(KEY);
    return true;
  }
  return false;
}

export function setAnalyticsOn(on: boolean): void {
  if (on) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, String(Date.now()));
}
