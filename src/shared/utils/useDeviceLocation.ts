"use client";

import { useEffect } from "react";
import { isAnalyticsOn } from "@/shared/analytics/utils/analyticsConsent";
import { analyticsConfigured, publishDeviceLocation } from "@/shared/analytics/utils/posthog";
import {
  deviceLocationSupported,
  FIRST_SCROLL_PX,
  locationAskedThisVisit,
  locationDeniedFlag,
  LocationRequestError,
  markLocationAsked,
  planLocationAsk,
  readDeviceFix,
  readGeoPermission,
  rememberLocationDenied,
  requestDeviceFix,
  writeDeviceFix,
  type GeoPermission,
  type LocationPlan,
} from "@/shared/utils/deviceLocation";

/**
 * Mount once (see Providers). No UI of our own: after the first real scroll,
 * the browser's own location prompt opens.
 */
export function useDeviceLocation(): void {
  useEffect(() => {
    if (!analyticsConfigured() || !isAnalyticsOn()) return;
    let alive = true;
    let booted = false;
    let scrolled = window.scrollY >= FIRST_SCROLL_PX;
    let permission: GeoPermission = "unknown";

    const plan = (): LocationPlan =>
      planLocationAsk({
        supported: deviceLocationSupported(),
        fix: readDeviceFix(),
        permission,
        asked: locationAskedThisVisit(),
        deniedFlag: locationDeniedFlag(),
        analyticsOn: isAnalyticsOn(),
        scrolled,
      });

    const apply = (next: LocationPlan) => {
      if (next.kind === "skip") return;
      if (next.kind === "use") {
        publishDeviceLocation(next.fix);
        if (!next.refresh) return;
      }
      if (next.kind === "ask") markLocationAsked();
      void locate(() => alive);
    };

    const onScroll = () => {
      if (window.scrollY < FIRST_SCROLL_PX) return;
      scrolled = true;
      window.removeEventListener("scroll", onScroll);
      if (booted) apply(plan());
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    void (async () => {
      permission = await readGeoPermission();
      if (!alive) return;
      booted = true;
      const first = plan();
      if (first.kind !== "skip" || first.until === "never") {
        window.removeEventListener("scroll", onScroll);
      }
      apply(first);
    })();

    return () => {
      alive = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

async function locate(alive: () => boolean): Promise<void> {
  try {
    const fix = await requestDeviceFix();
    if (!alive()) return;
    writeDeviceFix(fix);
    publishDeviceLocation(fix);
  } catch (err) {
    if (err instanceof LocationRequestError && err.reason === "denied") rememberLocationDenied();
  }
}
