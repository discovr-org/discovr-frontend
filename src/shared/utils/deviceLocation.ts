/**
 * One device location for the whole app.
 * Stored on the device. PostHog is a consumer, not the owner.
 * Safari only shows the permission prompt when getCurrentPosition runs inside a tap.
 */

const FIX_KEY = "discovr.deviceLocation";
const DENIED_KEY = "discovr.locationDenied";
const DISMISS_KEY = "discovr.locationAsk.dismissed";

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
};

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
  return {
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

export function locationAskDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/** "Not now" lasts this visit. A new visit can ask once more. */
export function dismissLocationAsk(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
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
 * Call this directly from a click or tap. The precise read starts in that same turn,
 * which is what Safari requires before it will show the prompt.
 * A timeout or a miss falls back to a coarser, faster read. Permission is already
 * settled by then, so that second read does not need another tap.
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
 * A granted permission refreshes quietly, with no bar and no prompt.
 */
export function planLocationAsk(input: {
  supported: boolean;
  fix: DeviceFix | null;
  permission: GeoPermission;
  dismissed: boolean;
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
  if (input.dismissed) return { kind: "skip", until: "never" };
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
