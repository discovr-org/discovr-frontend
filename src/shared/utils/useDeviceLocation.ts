"use client";

import { useEffect } from "react";
import { isAnalyticsOn } from "@/shared/analytics/utils/analyticsConsent";
import { analyticsConfigured, publishDeviceLocation } from "@/shared/analytics/utils/posthog";
import {
  ASK_AFTER_MS,
  deviceLocationSupported,
  locationAskedThisVisit,
  locationDeniedFlag,
  LocationRequestError,
  markLocationAsked,
  planLocationAsk,
  readDeviceFix,
  readGeoPermission,
  rememberLocationDenied,
  requestDeviceFix,
  resolveDevicePlace,
  writeDeviceFix,
  type GeoPermission,
  type LocationPlan,
} from "@/shared/utils/deviceLocation";

/**
 * Mount once (see Providers). No UI of our own: after 30 seconds on the site,
 * the browser's own location prompt opens.
 */
export function useDeviceLocation(): void {
  useEffect(() => {
    if (!analyticsConfigured() || !isAnalyticsOn()) return;
    let alive = true;
    let booted = false;
    let waited = false;
    let permission: GeoPermission = "unknown";

    const plan = (): LocationPlan =>
      planLocationAsk({
        supported: deviceLocationSupported(),
        fix: readDeviceFix(),
        permission,
        asked: locationAskedThisVisit(),
        deniedFlag: locationDeniedFlag(),
        analyticsOn: isAnalyticsOn(),
        waited,
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

    const timer = window.setTimeout(() => {
      waited = true;
      if (booted) apply(plan());
    }, ASK_AFTER_MS);

    void (async () => {
      permission = await readGeoPermission();
      if (!alive) return;
      booted = true;
      const first = plan();
      if (first.kind !== "skip" || first.until === "never") window.clearTimeout(timer);
      apply(first);
    })();

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);
}

async function locate(alive: () => boolean): Promise<void> {
  try {
    const fix = await requestDeviceFix();
    if (!alive()) return;
    writeDeviceFix(fix);
    await resolveDevicePlace(fix);
    publishDeviceLocation(fix);
  } catch (err) {
    if (err instanceof LocationRequestError && err.reason === "denied") rememberLocationDenied();
  }
}
