"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { PwaProvider } from "@/shared/components/PwaProvider";
import { SavedProvider } from "@/shared/components/SavedProvider";
import { ToastProvider } from "@/shared/components/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PwaProvider>
      <ToastProvider>
        <SavedProvider>
          <AuthProvider>{children}</AuthProvider>
        </SavedProvider>
      </ToastProvider>
    </PwaProvider>
  );
}
