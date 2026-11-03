"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { ArrowUpRightIcon, PhoneIcon } from "@/shared/components/icons";
import { Input, Textarea } from "@/shared/components/Input";
import { Radio, RadioGroup } from "@/shared/components/SelectionControl";
import { DISCOVR_PHONE, discovrWhatsApp } from "@/shared/utils/discovrContact";
import { track } from "@/shared/analytics/utils/track";
import { submitHelpRequest } from "../utils/helpRequestApi";
import styles from "../styles/help.module.css";

const CATEGORIES = [
  { value: "problem_with_experience", label: "Problem with an experience" },
  { value: "host_unreachable", label: "Couldn't reach the host" },
  { value: "felt_unsafe", label: "I felt unsafe" },
  { value: "price_or_payment_issue_with_host", label: "Price or payment issue with the host" },
  { value: "something_else", label: "Something else" },
];

export function HelpPage() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setError(undefined);
    setState("sending");
    try {
      await submitHelpRequest({ category, message, name, phone });
      track("help_request_submitted", { category: category || "unspecified" });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't go through. Try again in a moment.");
      setState("idle");
    }
  }

  return (
    <div>
      <div className={styles.page}>
        <h1 className="display-md">Help and contact</h1>
        <div className={styles.contact}>
          <Button variant="secondary" href={`tel:${DISCOVR_PHONE}`} icon={<PhoneIcon />}>
            Call us
          </Button>
          <Button
            variant="secondary"
            href={discovrWhatsApp("Hi discovr, ")}
            target="_blank"
            rel="noopener"
            icon={<ArrowUpRightIcon />}
          >
            WhatsApp us
          </Button>
        </div>
        {state === "done" ? (
          <p className={styles.done} role="status">
            Got it. Someone from the team will get back to you on {phone.trim()}.
          </p>
        ) : (
          <form className={styles.form} onSubmit={onSubmit} noValidate data-ph-no-capture>
            <RadioGroup legend="What's it about">
              {CATEGORIES.map((c) => (
                <Radio
                  key={c.value}
                  name="category"
                  value={c.value}
                  label={c.label}
                  checked={category === c.value}
                  onChange={() => setCategory(c.value)}
                />
              ))}
            </RadioGroup>
            <Textarea
              label="Message"
              required
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Input
              label="Your name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send"}
            </Button>
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
