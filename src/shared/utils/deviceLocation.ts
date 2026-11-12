/**
 * One device location for the whole app.
 * Stored on the device. PostHog is a consumer, not the owner.
 */

const FIX_KEY = "discovr.deviceLocation";
const DENIED_KEY = "discovr.locationDenied";
const ASKED_KEY = "discovr.locationAsked";
const PLACE_KEY = "discovr.devicePlace";

/** iOS moves the toolbar with a few pixels of scroll. A real scroll is past this. */
export const FIRST_SCROLL_PX = 48;

const PRECISE: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 120_000,
};

const COARSE: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8_000,
  maximumAge: 300_000,
};

export type DeviceFix = {
  latitude: number;
  longitude: number;
  /** Metres, as reported by the browser. */
  accuracy: number;
  capturedAt: string;
};

export type DeviceLocationFields = {
  device_latitude: number;
  device_longitude: number;
  device_location_accuracy_m: number;
  location_source: "device";
  /** Named place for the fix, e.g. "Anjuna", "Goa", "India". Absent until looked up. */
  device_city?: string;
  device_state?: string;
  device_country?: string;
};

/** Where a fix is, in words. Stored with the coordinates it was looked up for. */
export type DevicePlace = { latitude: number; longitude: number; city: string; state: string; country: string };

export type GeoPermission = "granted" | "denied" | "prompt" | "unknown";

export type LocationFailure = "denied" | "unavailable" | "timeout" | "unsupported";

export type LocationPlan =
  | { kind: "skip"; until: "scroll" | "never" }
  | { kind: "use"; fix: DeviceFix; refresh: boolean }
  | { kind: "refresh" }
  | { kind: "ask" };

export class LocationRequestError extends Error {
  readonly reason: LocationFailure;

  constructor(reason: LocationFailure) {
    super(reason);
    this.name = "LocationRequestError";
    this.reason = reason;
  }
}

export function deviceLocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function deviceLocationFields(fix: DeviceFix): DeviceLocationFields {
  const place = readDevicePlace();
  const named = place && near(place, fix) ? place : null;
  return {
    ...(named
      ? {
          ...(named.city ? { device_city: named.city } : {}),
          ...(named.state ? { device_state: named.state } : {}),
          ...(named.country ? { device_country: named.country } : {}),
        }
      : {}),
    device_latitude: round5(fix.latitude),
    device_longitude: round5(fix.longitude),
    device_location_accuracy_m: Math.max(0, Math.round(fix.accuracy)),
    location_source: "device",
  };
}

export function readDeviceFix(): DeviceFix | null {
  const value = readJson(localStorageOrNull(), FIX_KEY);
  return isFix(value) ? value : null;
}

function readDevicePlace(): DevicePlace | null {
  const v = readJson(localStorageOrNull(), PLACE_KEY) as Partial<DevicePlace> | null;
  return v && typeof v.latitude === "number" && typeof v.longitude === "number" ? (v as DevicePlace) : null;
}

/** Within about 5 km, so the same town keeps its name without a new lookup. */
function near(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.05 && Math.abs(a.longitude - b.longitude) < 0.05;
}

/**
 * Turn the fix into a place name once, then reuse it. Only the coordinates rounded to ~1 km
 * leave the device for the lookup (BigDataCloud, no key; api-bdc.io is its current host). Returns null if it fails; callers carry on.
 */
export async function resolveDevicePlace(fix: DeviceFix): Promise<DevicePlace | null> {
  const known = readDevicePlace();
  if (known && near(known, fix)) return known;
  try {
    const q = new URLSearchParams({
      latitude: fix.latitude.toFixed(2),
      longitude: fix.longitude.toFixed(2),
      localityLanguage: "en",
    });
    const res = await fetch(`https://api-bdc.io/data/reverse-geocode-client?${q}`, {
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const place: DevicePlace = {
      latitude: fix.latitude,
      longitude: fix.longitude,
      city: str(d.city) || str(d.locality),
      state: str(d.principalSubdivision),
      country: str(d.countryName),
    };
    if (!place.city && !place.state && !place.country) return null;
    localStorageOrNull()?.setItem(PLACE_KEY, JSON.stringify(place));
    return place;
  } catch {
    return null;
  }
}

export function writeDeviceFix(fix: DeviceFix): void {
  const store = localStorageOrNull();
  if (!store) return;
  try {
    store.setItem(FIX_KEY, JSON.stringify(fix));
    store.removeItem(DENIED_KEY);
  } catch {
    // Private mode can refuse storage. The fix still goes to PostHog for this visit.
  }
}

export function locationDeniedFlag(): boolean {
  try {
    return localStorage.getItem(DENIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberLocationDenied(): void {
  try {
    localStorage.setItem(DENIED_KEY, "1");
  } catch {
    // Ignore. The browser will keep refusing the prompt anyway.
  }
}

export function locationAskedThisVisit(): boolean {
  try {
    return sessionStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false;
  }
}

/** One browser prompt per visit, even if they close it without answering. */
export function markLocationAsked(): void {
  try {
    sessionStorage.setItem(ASKED_KEY, "1");
  } catch {
    // Ignore. Worst case we ask again after a reload.
  }
}

export async function readGeoPermission(): Promise<GeoPermission> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") {
      return status.state;
    }
    return "unknown";
  } catch {
    // Safari before 16 throws on this query. Treat it as "we have to ask".
    return "unknown";
  }
}

/**
 * Opens the browser's prompt when permission isn't settled yet.
 * A timeout or a miss falls back to a coarser, faster read. Permission is already
 * settled by then, so that second read does not prompt again.
 */
export function requestDeviceFix(): Promise<DeviceFix> {
  return readPosition(PRECISE).catch((err: unknown) => {
    if (
      err instanceof LocationRequestError &&
      (err.reason === "timeout" || err.reason === "unavailable")
    ) {
      return readPosition(COARSE);
    }
    throw err;
  });
}

/**
 * Ask only after a real scroll, and only when this device has no fix.
 * A granted permission refreshes quietly, with no prompt.
 */
export function planLocationAsk(input: {
  supported: boolean;
  fix: DeviceFix | null;
  permission: GeoPermission;
  asked: boolean;
  deniedFlag: boolean;
  analyticsOn: boolean;
  scrolled: boolean;
}): LocationPlan {
  if (!input.analyticsOn || !input.supported) return { kind: "skip", until: "never" };
  if (input.permission === "denied") return { kind: "skip", until: "never" };

  if (input.fix) {
    return { kind: "use", fix: input.fix, refresh: input.permission === "granted" };
  }
  if (input.permission === "granted") return { kind: "refresh" };

  if (!input.scrolled) return { kind: "skip", until: "scroll" };
  if (input.asked) return { kind: "skip", until: "never" };
  // Old Safari can't tell us the permission. A previous hard deny should stick.
  if (input.deniedFlag && input.permission === "unknown") return { kind: "skip", until: "never" };

  return { kind: "ask" };
}

function readPosition(options: PositionOptions): Promise<DeviceFix> {
  return new Promise((resolve, reject) => {
    if (!deviceLocationSupported()) {
      reject(new LocationRequestError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(fixFrom(pos)),
      (err) => reject(new LocationRequestError(reasonOf(err))),
      options,
    );
  });
}

function fixFrom(pos: GeolocationPosition): DeviceFix {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : 0,
    capturedAt: new Date(pos.timestamp).toISOString(),
  };
}

function reasonOf(err: GeolocationPositionError): LocationFailure {
  if (err.code === err.PERMISSION_DENIED) return "denied";
  if (err.code === err.TIMEOUT) return "timeout";
  return "unavailable";
}

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

function localStorageOrNull(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function readJson(store: Storage | null, key: string): unknown {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function isFix(value: unknown): value is DeviceFix {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.latitude === "number" &&
    Number.isFinite(v.latitude) &&
    typeof v.longitude === "number" &&
    Number.isFinite(v.longitude) &&
    typeof v.accuracy === "number" &&
    Number.isFinite(v.accuracy) &&
    v.accuracy >= 0 &&
    typeof v.capturedAt === "string"
  );
}
