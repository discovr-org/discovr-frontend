import posthog from "posthog-js";
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

/** True once PostHog is loaded and the visitor hasn't turned analytics off. */
export function analyticsActive(): boolean {
  return Boolean(KEY) && posthog.__loaded && !posthog.has_opted_out_capturing();
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
  const campaign = pendingQrCampaign();
  if (campaign) {
    posthog.setPersonProperties(undefined, { qr_campaign: campaign });
    markQrCampaignSent();
  }
}

/** Forget the account on sign-out, so the next visitor on this device starts fresh. */
export function resetUser(): void {
  if (posthog.__loaded) posthog.reset();
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

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}
