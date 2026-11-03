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
  type VerifyResult,
} from "@/features/auth/components/AuthSheet";
import { requestOtp, verifyOtp, saveName, logoutSession } from "@/features/auth/utils/authApi";
import { primeKeyboard } from "@/features/auth/utils/keyboard";
import {
  clearSession,
  readSession,
  writeSession,
  type SessionUser,
} from "@/features/auth/utils/session";
import { useSaved } from "@/shared/components/SavedProvider";

export type AuthIntent = "save" | "call" | "profile";

/** Name-step button: finish the thing they tapped. */
const CTA_LABEL: Record<AuthIntent, string> = {
  save: "Save",
  call: "Call to book",
  profile: "Done",
};

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
      // Must run inside the tap, or iOS won't open the keyboard for the sheet.
      primeKeyboard();
      setPending(intent);
      setPendingAction(() => ifAuthed);
      setAuthOpen(true);
    },
    [],
  );

  const openAuth = useCallback((intent: AuthIntent = "profile") => {
    primeKeyboard();
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

  // Signed in from here on, even if they drop off at the name step; the server asks again next time.
  const onVerifyCode = useCallback(
    async (phone: PhoneNumber, code: string): Promise<VerifyResult> => {
      try {
        const result = await verifyOtp(phone, code);
        const next: SessionUser = {
          phoneE164: result.phoneE164,
          sessionId: result.sessionId,
          userId: result.userId,
          name: result.name ?? undefined,
        };
        writeSession(next);
        setUser(next);
        return { ok: true, isNewUser: result.isNewUser, name: result.name ?? undefined };
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (/wrong code/i.test(message)) return { ok: false };
        throw err;
      }
    },
    [],
  );

  const onSaveName = useCallback(async (_phone: PhoneNumber, name: string) => {
    const session = readSession();
    if (!session) throw new Error("Not signed in");
    const saved = await saveName(session.sessionId, name);
    const next = { ...session, name: saved };
    writeSession(next);
    setUser(next);
  }, []);

  const onSuccess = useCallback(
    async () => {
      const session = readSession();
      if (session) await saved.syncAfterLogin(session.sessionId);
      setAuthOpen(false);
      const action = pendingAction;
      setPending(null);
      setPendingAction(null);
      action?.();
    },
    [pendingAction, saved],
  );

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
        onSaveName={onSaveName}
        onSuccess={onSuccess}
        ctaLabel={CTA_LABEL[pending ?? "profile"]}
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
