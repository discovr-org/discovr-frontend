"use client";

import { useCallback, useState } from "react";
import type { PhoneNumber } from "@/features/auth/components/AuthSheet";
import { mockSendCode, mockVerifyCode } from "@/features/auth/utils/mockOtp";
import {
  readSession,
  writeSession,
  type SessionUser,
} from "@/features/auth/utils/session";

export type AuthIntent = "save" | "call";

/**
 * Gates Save / Call to book behind phone login, matching the signup prototype:
 * open AuthSheet only when the action needs an account; on success, finish that action.
 */
export function useAuthGate() {
  const [user, setUser] = useState<SessionUser | null>(() => readSession());
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, setPending] = useState<AuthIntent | null>(null);

  const requireAuth = useCallback((intent: AuthIntent, ifAuthed: () => void) => {
    if (readSession()) {
      ifAuthed();
      return;
    }
    setPending(intent);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPending(null);
  }, []);

  const onSendCode = useCallback(async (phone: PhoneNumber) => {
    await mockSendCode(phone);
  }, []);

  const onVerifyCode = useCallback(async (phone: PhoneNumber, code: string) => {
    return mockVerifyCode(phone, code);
  }, []);

  const onSuccess = useCallback(
    (phone: PhoneNumber, runPending: (intent: AuthIntent) => void) => {
      const next = { phoneE164: phone.e164 };
      writeSession(next);
      setUser(next);
      setAuthOpen(false);
      const intent = pending;
      setPending(null);
      if (intent) runPending(intent);
    },
    [pending],
  );

  return {
    user,
    authOpen,
    pending,
    requireAuth,
    closeAuth,
    onSendCode,
    onVerifyCode,
    onSuccess,
  };
}
