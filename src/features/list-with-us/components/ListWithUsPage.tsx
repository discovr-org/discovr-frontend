"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { Input, Textarea } from "@/shared/components/Input";
import { submitHostApplication } from "../utils/hostApplicationApi";
import styles from "../styles/listWithUs.module.css";

export function ListWithUsPage({ lead }: { lead: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Goa");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setError(undefined);
    setState("sending");
    try {
      await submitHostApplication({ name, phone, city, description });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't go through. Try again in a moment.");
      setState("idle");
    }
  }

  return (
    <div>
      <div className={styles.page}>
        <h1 className="display-md">List with us</h1>
        <p className={styles.lead}>{lead}</p>
        {state === "done" ? (
          <p className={styles.done} role="status">
            Thanks, {name.trim().split(" ")[0]}. Someone from the team will message you on WhatsApp.
          </p>
        ) : (
          <form className={styles.form} onSubmit={onSubmit} noValidate data-ph-no-capture>
            <Input
              label="Your name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="WhatsApp number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
            <Textarea
              label="What you run"
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
