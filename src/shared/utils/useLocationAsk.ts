"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAnalyticsOn } from "@/shared/analytics/utils/analyticsConsent";
import { analyticsConfigured, publishDeviceLocation } from "@/shared/analytics/utils/posthog";
import {
  dismissLocationAsk,
  deviceLocationSupported,
  FIRST_SCROLL_PX,
  locationAskDismissed,
  locationDeniedFlag,
  LocationRequestError,
  planLocationAsk,
  readDeviceFix,
  readGeoPermission,
  rememberLocationDenied,
  requestDeviceFix,
  writeDeviceFix,
  type GeoPermission,
  type LocationPlan,
} from "@/shared/utils/deviceLocation";

export type LocationAskPhase = "hidden" | "ask" | "locating" | "error";

/**
 * One ask for the whole visit. Mount once (see Providers).
 * Scroll arms it. The tap is what Safari will accept.
 */
export function useLocationAsk(): {
  phase: LocationAskPhase;
  allow: () => void;
  dismiss: () => void;
} {
  const [phase, setPhase] = useState<LocationAskPhase>("hidden");
  const permission = useRef<GeoPermission>("unknown");
  const booted = useRef(false);
  const scrolled = useRef(false);
  const requestId = useRef(0);

  const apply = useCallback((plan: LocationPlan) => {
    if (plan.kind === "skip") return;
    if (plan.kind === "ask") {
      setPhase((current) => (current === "locating" ? current : "ask"));
      return;
    }
    if (plan.kind === "use") {
      publishDeviceLocation(plan.fix);
      if (plan.refresh) void refreshQuietly(requestId, permission);
    } else if (plan.kind === "refresh") {
      void refreshQuietly(requestId, permission);
    }
    setPhase("hidden");
  }, []);

  const snapshot = useCallback(
    () =>
      planLocationAsk({
        supported: deviceLocationSupported(),
        fix: readDeviceFix(),
        permission: permission.current,
        dismissed: locationAskDismissed(),
        deniedFlag: locationDeniedFlag(),
        analyticsOn: isAnalyticsOn(),
        scrolled: scrolled.current,
      }),
    [],
  );

  useEffect(() => {
    if (!analyticsConfigured() || !isAnalyticsOn()) return;
    let alive = true;
    if (window.scrollY >= FIRST_SCROLL_PX) scrolled.current = true;

    const onScroll = () => {
      if (window.scrollY < FIRST_SCROLL_PX) return;
      scrolled.current = true;
      window.removeEventListener("scroll", onScroll);
      if (booted.current) apply(snapshot());
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    void (async () => {
      permission.current = await readGeoPermission();
      if (!alive) return;
      booted.current = true;
      const plan = snapshot();
      if (plan.kind !== "skip" || plan.until === "never") {
        window.removeEventListener("scroll", onScroll);
      }
      apply(plan);
    })();

    return () => {
      alive = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, [apply, snapshot]);

  const allow = useCallback(() => {
    const id = ++requestId.current;
    setPhase("locating");
    void requestDeviceFix()
      .then((fix) => {
        if (requestId.current !== id) return;
        writeDeviceFix(fix);
        publishDeviceLocation(fix);
        permission.current = "granted";
        setPhase("hidden");
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return;
        if (err instanceof LocationRequestError && err.reason === "denied") {
          rememberLocationDenied();
          permission.current = "denied";
          setPhase("hidden");
          return;
        }
        setPhase("error");
      });
  }, []);

  const dismiss = useCallback(() => {
    requestId.current += 1;
    dismissLocationAsk();
    setPhase("hidden");
  }, []);

  return { phase, allow, dismiss };
}

async function refreshQuietly(
  requestId: { current: number },
  permission: { current: GeoPermission },
): Promise<void> {
  const id = ++requestId.current;
  try {
    const fix = await requestDeviceFix();
    if (requestId.current !== id) return;
    writeDeviceFix(fix);
    publishDeviceLocation(fix);
    permission.current = "granted";
  } catch (err) {
    if (requestId.current !== id) return;
    if (err instanceof LocationRequestError && err.reason === "denied") {
      rememberLocationDenied();
      permission.current = "denied";
    }
  }
}
