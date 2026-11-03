"use client";

import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input, Textarea } from "@/shared/components/Input";
import { PanelSheet } from "@/shared/components/PanelSheet";
import { Radio, RadioGroup } from "@/shared/components/SelectionControl";
import { discovrWhatsApp } from "@/shared/utils/discovrContact";
import { track } from "@/shared/analytics/utils/track";
import styles from "../styles/reportSheet.module.css";

const KINDS = [
  ["price_changed", "Price changed"],
  ["closed_or_not_running", "Not running or closed"],
  ["wrong_timing", "Timing is wrong"],
  ["booking_link_broken", "Booking link doesn't work"],
  ["wrong_phone_or_instagram", "Phone or Instagram is wrong"],
  ["wrong_location", "Location is wrong"],
  ["other", "Something else"],
] as const;

/**
 * "What's wrong?" sheet behind "Report wrong information". There is no reports
 * API yet, so Send hands the report to our WhatsApp with the text filled in.
 */
export function ReportSheet({
  open,
  onClose,
  listingTitle,
  slug,
}: {
  open: boolean;
  onClose: () => void;
  listingTitle: string;
  slug: string;
}) {
  const [kind, setKind] = useState<string>("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const label = KINDS.find(([k]) => k === kind)?.[1];

  const send = () => {
    const text = [
      `Wrong information on ${listingTitle} (discovr.in/experiences/${slug})`,
      label ? `What's wrong: ${label}` : null,
      message.trim() || null,
      phone.trim() ? `Tell me when it's fixed: ${phone.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    track("report_submitted", { slug, title: listingTitle, kind: kind || "unspecified" });
    window.open(discovrWhatsApp(text), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <PanelSheet
      open={open}
      onClose={onClose}
      title="What's wrong?"
      footer={
        <Button variant="primary" fullWidth onClick={send} disabled={!kind}>
          Send report
        </Button>
      }
    >
      <div className={styles.form}>
        <RadioGroup legend="What's wrong" className={styles.kinds}>
          {KINDS.map(([value, text]) => (
            <Radio
              key={value}
              name="kind"
              value={value}
              label={text}
              checked={kind === value}
              onChange={() => setKind(value)}
            />
          ))}
        </RadioGroup>
        <Textarea
          label="Message (optional)"
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint="Leave your number if you want to hear when it's fixed."
        />
      </div>
    </PanelSheet>
  );
}
