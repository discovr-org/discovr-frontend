"use client";

export type SessionUser = {
  phoneE164: string;
  /** Opaque Bearer token from `/v1/auth/otp/verify`. */
  sessionId: string;
  userId?: string;
};

const KEY = "discovr.session";

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed?.phoneE164 || !parsed?.sessionId) return null;
    return {
      phoneE164: parsed.phoneE164,
      sessionId: parsed.sessionId,
      userId: parsed.userId,
    };
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
