"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { isAnalyticsOn, setAnalyticsOn } from "@/shared/analytics/utils/analyticsConsent";
import { startAnalytics, stopAnalytics } from "@/shared/analytics/utils/posthog";
import styles from "../styles/legalPage.module.css";

export function ConsentSettings() {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(isAnalyticsOn());
  }, []);

  if (on === null) return null;

  const toggle = () => {
    if (on) stopAnalytics();
    setAnalyticsOn(!on);
    if (!on) startAnalytics();
    setOn(!on);
  };

  return (
    <div className={styles.consent}>
      <p aria-live="polite">Analytics is {on ? "on" : "off"} for this device.</p>
      <Button variant="secondary" onClick={toggle}>
        {on ? "Turn off" : "Turn on"}
      </Button>
    </div>
  );
}
