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
import { readSession } from "@/features/auth/utils/session";
import {
  deleteRemoteSave,
  fetchRemoteSaves,
  putRemoteSave,
  syncSavesToRemote,
} from "@/shared/utils/savesApi";
import {
  readSavedSlugs,
  SAVED_CHANGED_EVENT,
  toggleSavedSlug,
  writeSavedSlugs,
} from "@/shared/utils/savedStore";

type SavedContextValue = {
  slugs: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
  hasAny: boolean;
  /** After login: merge local + remote, then push to DB. */
  syncAfterLogin: (sessionId: string) => Promise<void>;
  /** On app load when already signed in. */
  hydrateFromRemote: (sessionId: string) => Promise<void>;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSavedSlugs());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string[]>).detail;
      setSlugs(Array.isArray(detail) ? detail : readSavedSlugs());
    };
    window.addEventListener(SAVED_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(SAVED_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    const session = readSession();
    if (!session?.sessionId) return;
    let cancelled = false;
    fetchRemoteSaves(session.sessionId).then((remote) => {
      if (cancelled || !remote) return;
      const merged = [...new Set([...readSavedSlugs(), ...remote])];
      writeSavedSlugs(merged);
      void syncSavesToRemote(session.sessionId, merged);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback((slug: string) => {
    const was = readSavedSlugs().includes(slug);
    const next = toggleSavedSlug(slug);
    setSlugs(next);
    const session = readSession();
    if (session?.sessionId) {
      if (was) void deleteRemoteSave(session.sessionId, slug);
      else void putRemoteSave(session.sessionId, slug);
    }
    return !was;
  }, []);

  const syncAfterLogin = useCallback(async (sessionId: string) => {
    const local = readSavedSlugs();
    const remote = (await fetchRemoteSaves(sessionId)) ?? [];
    const merged = [...new Set([...local, ...remote])];
    writeSavedSlugs(merged);
    setSlugs(merged);
    await syncSavesToRemote(sessionId, merged);
  }, []);

  const hydrateFromRemote = useCallback(async (sessionId: string) => {
    const remote = await fetchRemoteSaves(sessionId);
    if (!remote) return;
    const merged = [...new Set([...readSavedSlugs(), ...remote])];
    writeSavedSlugs(merged);
    setSlugs(merged);
  }, []);

  const value = useMemo(
    () => ({
      slugs,
      isSaved,
      toggle,
      hasAny: slugs.length > 0,
      syncAfterLogin,
      hydrateFromRemote,
    }),
    [slugs, isSaved, toggle, syncAfterLogin, hydrateFromRemote],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used inside SavedProvider");
  }
  return ctx;
}
