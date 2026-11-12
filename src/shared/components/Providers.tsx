"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { LocationAsk } from "@/shared/components/LocationAsk";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { PwaProvider } from "@/shared/components/PwaProvider";
import { SavedProvider } from "@/shared/components/SavedProvider";
import { ToastProvider } from "@/shared/components/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
    <PwaProvider>
      <ToastProvider>
        <SavedProvider>
          <AuthProvider>
            {children}
            <LocationAsk />
          </AuthProvider>
        </SavedProvider>
      </ToastProvider>
    </PwaProvider>
    </QueryProvider>
  );
}
