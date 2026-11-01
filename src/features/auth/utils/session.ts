"use client";

export type SessionUser = {
  phoneE164: string;
};

const KEY = "discovr.session";

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.phoneE164) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser): void {
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(KEY);
}
