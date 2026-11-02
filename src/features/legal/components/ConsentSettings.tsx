"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { isAnalyticsOn, setAnalyticsOn } from "../utils/analyticsConsent";
import styles from "../styles/legalPage.module.css";

export function ConsentSettings() {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(isAnalyticsOn());
  }, []);

  if (on === null) return null;

  const toggle = () => {
    setAnalyticsOn(!on);
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
