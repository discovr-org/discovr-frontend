"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { exchangeHandoffCode, fetchHandoffCode } from "@/features/auth/utils/handoffApi";
import { readSession, writeSession } from "@/features/auth/utils/session";

const CODE_KEY = "discovr.handoff";
/** Codes live 30 minutes on the server. Reuse one for 20, then ask for a fresh one. */
const REUSE_MS = 20 * 60 * 1000;

const isIos = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * An iOS Home Screen app starts with empty storage, so it would ask a signed-in person to sign in again.
 * 1. In the browser, signed in: point the install file at a one-use code (the app opens at /?h=<code>).
 * 2. In the app, first launch with ?h=: swap the code for the app's own session.
 */
export function PwaHandoff() {
  const { user } = useAuth();
  const sessionId = user?.sessionId;

  // 2. First launch of the installed app.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("h");
    if (!code) return;
    url.searchParams.delete("h");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash); // the code never stays in the address
    if (readSession()) return;
    exchangeHandoffCode(code)
      .then((session) => {
        writeSession(session);
        window.location.replace("/"); // reload so the whole app starts signed in
      })
      .catch(() => {}); // expired or used: they sign in the normal way
  }, []);

  // 1. Browser, signed in, on iOS.
  useEffect(() => {
    if (!sessionId || isStandalone() || !isIos()) return;
    let alive = true;
    const point = (code: string) => {
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (link && alive) link.href = `/manifest.webmanifest?h=${encodeURIComponent(code)}`;
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem(CODE_KEY) ?? "null") as { code: string; at: number } | null;
      if (saved && Date.now() - saved.at < REUSE_MS) return point(saved.code);
    } catch {}
    fetchHandoffCode(sessionId)
      .then((code) => {
        try {
          sessionStorage.setItem(CODE_KEY, JSON.stringify({ code, at: Date.now() }));
        } catch {}
        point(code);
      })
      .catch(() => {}); // no code: installing works as before, they sign in inside the app
    return () => {
      alive = false;
    };
  }, [sessionId]);

  return null;
}
