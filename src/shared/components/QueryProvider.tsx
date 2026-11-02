"use client";

import { useState, type ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const DAY = 24 * 60 * 60 * 1000;

/** Caches API data in localStorage so a refresh paints instantly, then updates in the background. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, gcTime: DAY } } }),
  );
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window === "undefined" ? undefined : window.localStorage,
      key: "discovr-query-cache",
    }),
  );
  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: DAY }}>
      {children}
    </PersistQueryClientProvider>
  );
}
