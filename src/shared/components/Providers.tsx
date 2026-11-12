"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { PwaProvider } from "@/shared/components/PwaProvider";
import { SavedProvider } from "@/shared/components/SavedProvider";
import { ToastProvider } from "@/shared/components/Toast";
import { useDeviceLocation } from "@/shared/utils/useDeviceLocation";

export function Providers({ children }: { children: ReactNode }) {
  useDeviceLocation();
  return (
    <QueryProvider>
    <PwaProvider>
      <ToastProvider>
        <SavedProvider>
          <AuthProvider>{children}</AuthProvider>
        </SavedProvider>
      </ToastProvider>
    </PwaProvider>
    </QueryProvider>
  );
}
