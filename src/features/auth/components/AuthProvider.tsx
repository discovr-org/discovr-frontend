"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthSheet,
  type PhoneNumber,
} from "@/features/auth/components/AuthSheet";
import { requestOtp, verifyOtp, logoutSession } from "@/features/auth/utils/authApi";
import {
  clearSession,
  readSession,
  writeSession,
  type SessionUser,
} from "@/features/auth/utils/session";
import { useSaved } from "@/shared/components/SavedProvider";

export type AuthIntent = "save" | "call" | "profile";

type AuthContextValue = {
  user: SessionUser | null;
  authOpen: boolean;
  pending: AuthIntent | null;
  /** If signed in, run `ifAuthed`. Else open signup and run after success. */
  requireAuth: (intent: AuthIntent, ifAuthed: () => void) => void;
  /** Open signup without a follow-up action. */
  openAuth: (intent?: AuthIntent) => void;
  closeAuth: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = useSaved();
  const [user, setUser] = useState<SessionUser | null>(() => readSession());
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, setPending] = useState<AuthIntent | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = useCallback(
    (intent: AuthIntent, ifAuthed: () => void) => {
      if (readSession()?.sessionId) {
        ifAuthed();
        return;
      }
      setPending(intent);
      setPendingAction(() => ifAuthed);
      setAuthOpen(true);
    },
    [],
  );

  const openAuth = useCallback((intent: AuthIntent = "profile") => {
    setPending(intent);
    setPendingAction(null);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPending(null);
    setPendingAction(null);
  }, []);

  const onSendCode = useCallback(async (phone: PhoneNumber) => {
    await requestOtp(phone);
  }, []);

  const onVerifyCode = useCallback(
    async (phone: PhoneNumber, code: string) => {
      try {
        const result = await verifyOtp(phone, code);
        const next: SessionUser = {
          phoneE164: result.phoneE164,
          sessionId: result.sessionId,
          userId: result.userId,
        };
        writeSession(next);
        setUser(next);
        await saved.syncAfterLogin(result.sessionId);
        setAuthOpen(false);
        const action = pendingAction;
        setPending(null);
        setPendingAction(null);
        action?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (/wrong code/i.test(message)) return false;
        throw err;
      }
    },
    [pendingAction, saved],
  );

  const onSuccess = useCallback((_phone: PhoneNumber) => {
    // Session + sync already handled in onVerifyCode.
  }, []);

  const signOut = useCallback(async () => {
    const session = readSession();
    if (session?.sessionId) await logoutSession(session.sessionId);
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authOpen,
      pending,
      requireAuth,
      openAuth,
      closeAuth,
      signOut,
    }),
    [user, authOpen, pending, requireAuth, openAuth, closeAuth, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthSheet
        open={authOpen}
        onClose={closeAuth}
        onSendCode={onSendCode}
        onVerifyCode={onVerifyCode}
        onSuccess={onSuccess}
        termsHref="/legal/terms"
        privacyHref="/legal/privacy"
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
