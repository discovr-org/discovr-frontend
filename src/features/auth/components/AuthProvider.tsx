"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { identifyUser, resetUser } from "@/shared/analytics/utils/posthog";
import { track } from "@/shared/analytics/utils/track";

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
      track("auth_sheet_opened", { intent });
    },
    [],
  );

  const openAuth = useCallback((intent: AuthIntent = "profile") => {
    primeKeyboard();
    track("auth_sheet_opened", { intent });
    setPending(intent);
    setPendingAction(null);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPending(null);
    setPendingAction(null);
  }, []);

  const intent = pending ?? "profile";

  const onSendCode = useCallback(
    async (phone: PhoneNumber) => {
      try {
        await requestOtp(phone);
        track("otp_requested", { intent });
      } catch (err) {
        track("otp_failed", { step: "send", reason: "error" });
        throw err;
      }
    },
    [intent],
  );

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
        if (next.userId) identifyUser(next.userId);
        track("otp_verified", { intent, needs_name: result.isNewUser || !result.name });
        return { ok: true, isNewUser: result.isNewUser, name: result.name ?? undefined };
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const wrongCode = /wrong code/i.test(message);
        track("otp_failed", { step: "verify", reason: wrongCode ? "wrong_code" : "error" });
        if (wrongCode) return { ok: false };
        throw err;
      }
    },
    [intent],
  );

  const onSaveName = useCallback(
    async (_phone: PhoneNumber, name: string) => {
      const session = readSession();
      if (!session) throw new Error("Not signed in");
      const saved = await saveName(session.sessionId, name);
      const next = { ...session, name: saved };
      writeSession(next);
      setUser(next);
      track("name_submitted", { intent });
    },
    [intent],
  );

  const onSuccess = useCallback(
    async () => {
      const session = readSession();
      if (session) await saved.syncAfterLogin(session.sessionId);
      track("auth_sheet_closed", { intent, completed: true });
      setAuthOpen(false);
      const action = pendingAction;
      setPending(null);
      setPendingAction(null);
      action?.();
    },
    [pendingAction, saved, intent],
  );

  const onClose = useCallback(() => {
    track("auth_sheet_closed", { intent, completed: Boolean(readSession()?.sessionId) });
    closeAuth();
  }, [closeAuth, intent]);

  const signOut = useCallback(async () => {
    const session = readSession();
    if (session?.sessionId) await logoutSession(session.sessionId);
    track("signed_out", {});
    resetUser();
    clearSession();
    setUser(null);
  }, []);

  // Returning visitors: link this device to their account by internal id.
  const userId = user?.userId;
  useEffect(() => {
    if (userId) identifyUser(userId);
  }, [userId]);

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
        onClose={onClose}
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
