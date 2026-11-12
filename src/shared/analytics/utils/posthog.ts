import posthog from "posthog-js";
import {
  deviceLocationFields,
  readDeviceFix,
  type DeviceFix,
  type DeviceLocationFields,
} from "@/shared/utils/deviceLocation";
import { isAnalyticsOn } from "./analyticsConsent";
import { pageTypeOf } from "./pageType";
import {
  isTshirtQrLanding,
  markQrCampaignSent,
  pendingQrCampaign,
  rememberQrCampaign,
  stripTshirtUtms,
  TSHIRT_QR,
} from "./qrCampaign";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";

/** True when a PostHog key was baked into this build. */
export function analyticsConfigured(): boolean {
  return Boolean(KEY);
}

/** True once PostHog is loaded and the visitor hasn't turned analytics off. */
export function analyticsActive(): boolean {
  return analyticsConfigured() && posthog.__loaded && !posthog.has_opted_out_capturing();
}

/** Called once at boot. Does nothing without a key or when analytics is off on this device. */
export function bootAnalytics(): void {
  if (isAnalyticsOn()) startAnalytics();
  // PostHog reads the shirt query during boot. If it never starts, still leave a clean URL.
  if (typeof window !== "undefined") stripTshirtUtms();
}

/** Load PostHog, or resume it after the visitor turns analytics back on. */
export function startAnalytics(): void {
  if (!KEY || typeof window === "undefined") return;
  if (posthog.__loaded) {
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
    claimTshirtQr();
    publishDeviceLocation();
    return;
  }
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    capture_exceptions: true,
    // Replays hide everything typed and anything marked data-ph-mask (e.g. the phone on Profile).
    session_recording: { maskAllInputs: true, maskTextSelector: "[data-ph-mask]" },
    before_send: (event) => {
      if (event) event.properties.page_type = pageTypeOf(window.location.pathname);
      return event;
    },
    loaded: (ph) => {
      // This device's choice wins over any older PostHog opt-out.
      if (ph.has_opted_out_capturing()) ph.opt_in_capturing();
      ph.register({
        app_surface: isStandalone() ? "pwa" : "browser",
        app_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      });
      if (process.env.NODE_ENV === "development") ph.debug();
      claimTshirtQr();
      publishDeviceLocation();
    },
  });
}

/** Stop sending anything from this device. */
export function stopAnalytics(): void {
  if (!posthog.__loaded) return;
  posthog.capture("analytics_opted_out");
  posthog.stopSessionRecording();
  posthog.opt_out_capturing();
}

/** Link this device to the signed-in account by internal id, with name, phone and sign-up date as person properties. */
export function identifyUser(
  userId: string,
  user: { name?: string; phoneE164?: string; createdAt?: string },
): void {
  if (!analyticsActive()) return;
  const set = {
    ...(user.name ? { name: user.name } : {}),
    ...(user.phoneE164 ? { phone_number: user.phoneE164 } : {}),
  };
  const setOnce = user.createdAt ? { created_at: user.createdAt } : undefined;
  if (posthog.get_distinct_id() !== userId) posthog.identify(userId, set, setOnce);
  else if (Object.keys(set).length || setOnce) posthog.setPersonProperties(set, setOnce);
  // Anonymous profiles are off, so the device spot has to be set again after identify.
  publishDeviceLocation();
  const campaign = pendingQrCampaign();
  if (campaign) {
    posthog.setPersonProperties(undefined, { qr_campaign: campaign });
    markQrCampaignSent();
  }
}

/** Forget the account on sign-out, so the next visitor on this device starts fresh. */
export function resetUser(): void {
  if (!posthog.__loaded) return;
  posthog.reset();
  publishDeviceLocation();
}

const PUBLISHED_KEY = "discovr.locationPublished";

/**
 * Put the device fix on later events.
 * `$geoip_*` is still PostHog's IP guess (often wrong in Safari). Filter on `device_latitude`.
 * `location_captured` fires once per visit unless the spot moves by about 100m.
 */
export function publishDeviceLocation(fix?: DeviceFix | null): void {
  if (!analyticsActive()) return;
  const stored = fix === undefined ? readDeviceFix() : fix;
  if (!stored) return;
  const props = deviceLocationFields(stored);
  posthog.register(props);
  posthog.setPersonProperties(props);
  if (sameSpot(props)) return;
  posthog.capture("location_captured", {
    device_latitude: props.device_latitude,
    device_longitude: props.device_longitude,
    device_location_accuracy_m: props.device_location_accuracy_m,
  });
  try {
    sessionStorage.setItem(
      PUBLISHED_KEY,
      JSON.stringify({
        device_latitude: props.device_latitude,
        device_longitude: props.device_longitude,
      }),
    );
  } catch {
    // The event already went out. A second one next time is acceptable.
  }
}

/**
 * One shirt scan. Must run while the utm query is still on the URL, before we hide it.
 * PostHog's own pageview fires just after this, and keeps the tags for the rest of the visit.
 */
function claimTshirtQr(): void {
  if (!isTshirtQrLanding(window.location.search)) return;
  if (analyticsActive()) {
    const props = {
      utm_source: TSHIRT_QR.source,
      utm_medium: TSHIRT_QR.medium,
      utm_campaign: TSHIRT_QR.campaign,
    };
    posthog.register_for_session(props);
    posthog.capture("qr_scanned", props);
    rememberQrCampaign(TSHIRT_QR.campaign);
  }
  stripTshirtUtms();
}

function sameSpot(props: DeviceLocationFields): boolean {
  try {
    const raw = sessionStorage.getItem(PUBLISHED_KEY);
    if (!raw) return false;
    const prev = JSON.parse(raw) as { device_latitude?: unknown; device_longitude?: unknown };
    if (typeof prev.device_latitude !== "number" || typeof prev.device_longitude !== "number") return false;
    // ~100m. GPS noise should not send the event again.
    return (
      Math.abs(prev.device_latitude - props.device_latitude) < 0.001 &&
      Math.abs(prev.device_longitude - props.device_longitude) < 0.001
    );
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}
