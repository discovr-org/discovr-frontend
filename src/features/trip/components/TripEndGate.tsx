"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import TripEndPrompt, { type TripEndAnswer } from "@/features/trip/components/TripEndPrompt";
import { fetchTrip, saveTrip } from "@/features/trip/utils/tripApi";
import { isoDay, readLocalTrip, shouldAsk, tripFromAnswer, writeLocalTrip, type Trip } from "@/features/trip/utils/trip";
import { setTripProperties } from "@/shared/analytics/utils/posthog";
import { track } from "@/shared/analytics/utils/track";

/** Seconds of real use (tab visible, touched or scrolled recently) before we ask. */
const ACTIVE_SECONDS = 30;
const IDLE_AFTER_MS = 15_000;
const ASKED_KEY = "discovr.tripAsked";

/** Asks "Till when are you in Goa?" once per visit, after 30 seconds of use, if we have no answer or it's time to ask again. */
export function TripEndGate() {
  const { user, authOpen } = useAuth();
  const sessionId = user?.sessionId;
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined); // undefined = still finding out
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // What do we know? Signed in: the DB wins, and an answer given as a guest moves up to it.
  useEffect(() => {
    let alive = true;
    const local = readLocalTrip();
    if (!sessionId) {
      setTrip(local);
      return;
    }
    setTrip(undefined);
    fetchTrip(sessionId)
      .then(async (saved) => {
        const known = saved ?? (local ? await saveTrip(sessionId, local).catch(() => local) : null);
        if (alive) setTrip(known);
      })
      .catch(() => alive && setTrip(local)); // API down: fall back to this device, don't nag twice
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Keep the PostHog person in step with whatever we know.
  useEffect(() => {
    if (trip) setTripProperties(trip);
  }, [trip]);

  // 30 seconds of use, once per visit.
  useEffect(() => {
    if (trip === undefined || !shouldAsk(trip, isoDay(new Date()))) return;
    try {
      if (sessionStorage.getItem(ASKED_KEY)) return;
    } catch {}
    let active = 0;
    let lastTouch = 0;
    const touch = () => (lastTouch = Date.now());
    const events = ["pointerdown", "scroll", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastTouch < IDLE_AFTER_MS) active += 1;
      if (active >= ACTIVE_SECONDS) setReady(true);
    }, 1000);
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [trip]);

  // Wait out the sign-in sheet rather than stacking two sheets.
  useEffect(() => {
    if (ready && !authOpen && !open) {
      try {
        sessionStorage.setItem(ASKED_KEY, "1");
      } catch {}
      setOpen(true);
      track("trip_end_shown", { had_answer: trip !== null });
    }
  }, [ready, authOpen, open, trip]);

  const onAnswer = useCallback(
    (answer: TripEndAnswer) => {
      const next = tripFromAnswer(answer, isoDay(new Date()));
      setOpen(false);
      setReady(false);
      setTrip(next);
      writeLocalTrip(next);
      track("trip_end_answered", {
        status: next.status,
        days_from_today: answer.kind === "date" ? answer.daysFromToday : undefined,
        signed_in: Boolean(sessionId),
      });
      if (sessionId) saveTrip(sessionId, next).catch(() => {}); // kept on the device; moves up next visit
    },
    [sessionId],
  );

  return <TripEndPrompt open={open} onAnswer={onAnswer} />;
}
