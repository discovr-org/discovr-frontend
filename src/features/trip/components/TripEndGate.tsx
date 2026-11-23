"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { readSession } from "@/features/auth/utils/session";
import TripEndPrompt, { type TripEndAnswer } from "@/features/trip/components/TripEndPrompt";
import { fetchTrip, saveTrip } from "@/features/trip/utils/tripApi";
import { isoDay, readLocalTrip, shouldAsk, tripFromAnswer, writeLocalTrip, type Trip } from "@/features/trip/utils/trip";
import { setTripProperties } from "@/shared/analytics/utils/posthog";
import { track } from "@/shared/analytics/utils/track";
import { useToast } from "@/shared/components/Toast";

/** Seconds of real use (tab visible, touched or scrolled recently) before we ask. */
const ACTIVE_SECONDS = 10;
const IDLE_AFTER_MS = 15_000;
const ASKED_KEY = "discovr.tripAsked";
/** Set when a guest answers, cleared once that answer is in their account. */
const UNSYNCED_KEY = "discovr.tripUnsynced";
const CONFIRM_TEXT = "You’re in. You’ll receive your ₹300 on WhatsApp soon";

function clearUnsynced() {
  try {
    sessionStorage.removeItem(UNSYNCED_KEY);
    localStorage.removeItem(UNSYNCED_KEY);
  } catch {}
}

/** Asks "Till when are you in Goa?" once per visit, after 10 seconds of use, if we have no answer or it's time to ask again. */
export function TripEndGate() {
  const { user, authOpen, requireAuth } = useAuth();
  const toast = useToast();
  const sessionId = user?.sessionId;
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined); // undefined = still finding out
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const askedThisVisit = useRef(false); // once the sheet has come up, it does not come up again until the next visit

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

  // 10 seconds of use, once per visit.
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
      if (active >= ACTIVE_SECONDS) {
        setReady(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [trip]);

  // Wait out the sign-in sheet rather than stacking two sheets.
  useEffect(() => {
    if (ready && !authOpen && !open && !askedThisVisit.current) {
      askedThisVisit.current = true;
      try {
        sessionStorage.setItem(ASKED_KEY, "1");
      } catch {}
      setOpen(true);
      track("trip_end_shown", { had_answer: trip !== null });
    }
  }, [ready, authOpen, open, trip]);

  // Keep what they tapped: on the device, in PostHog, and on their account if they are signed in. Returns whether they are.
  const record = useCallback((answer: TripEndAnswer): boolean => {
    // Ask the device, not a captured value: sign-in only opens for someone who is signed out right now.
    const sessionId = readSession()?.sessionId;
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
      // Guest: it stays on the device and moves to their account when they sign up.
      try {
        localStorage.setItem(UNSYNCED_KEY, "1");
      } catch {}
    }
    return Boolean(sessionId);
  }, []);

  const onAnswer = useCallback(
    (answer: TripEndAnswer) => {
      // Signed in: confirm at once. A guest gets the same line once signup is done.
      if (record(answer)) toast(CONFIRM_TEXT);
      else requireAuth("trip", () => toast(CONFIRM_TEXT));
    },
    [record, requireAuth, toast],
  );

  // Tapped outside (or Escape) from the question on. A day they had already tapped is kept; signup does not open.
  // The visit flag stops a second ask today.
  const onDismiss = useCallback(
    (answer?: TripEndAnswer) => {
      if (answer) record(answer);
      else {
        setOpen(false);
        setReady(false);
      }
      track("trip_end_dismissed", { answered: Boolean(answer) });
    },
    [record],
  );

  return <TripEndPrompt open={open} onAnswer={onAnswer} onDismiss={onDismiss} onReveal={() => track("trip_end_gift_revealed", {})} />;
}
