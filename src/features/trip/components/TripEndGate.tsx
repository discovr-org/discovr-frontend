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
/** Set when a guest answers, cleared once that answer is in their account. */
const UNSYNCED_KEY = "discovr.tripUnsynced";

function clearUnsynced() {
  try {
    sessionStorage.removeItem(UNSYNCED_KEY);
    localStorage.removeItem(UNSYNCED_KEY);
  } catch {}
}

/** Asks "Till when are you in Goa?" once per visit, after 30 seconds of use, if we have no answer or it's time to ask again. */
export function TripEndGate() {
  const { user, authOpen, openAuth } = useAuth();
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
    let unsynced = false;
    try {
      unsynced = sessionStorage.getItem(UNSYNCED_KEY) === "1" || localStorage.getItem(UNSYNCED_KEY) === "1";
    } catch {}
    fetchTrip(sessionId)
      .then(async (saved) => {
        // An answer given as a guest is newer than anything on the account, so it wins.
        const push = local && (unsynced || !saved);
        const known = push ? await saveTrip(sessionId, local).catch(() => local) : saved;
        if (push) clearUnsynced();
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
      if (sessionId) {
        saveTrip(sessionId, next).catch(() => {}); // kept on the device; moves up next visit
      } else {
        // Guest: keep it on the device, then ask them to sign up. It moves to their account when they do.
        try {
          localStorage.setItem(UNSYNCED_KEY, "1");
        } catch {}
        openAuth("trip");
      }
    },
    [sessionId, openAuth],
  );

  return <TripEndPrompt open={open} onAnswer={onAnswer} />;
}
