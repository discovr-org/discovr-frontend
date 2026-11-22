"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PwaHandoff } from "@/features/auth/components/PwaHandoff";
import { TripEndGate } from "@/features/trip/components/TripEndGate";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { QueryProvider } from "@/shared/components/QueryProvider";
import { PwaProvider } from "@/shared/components/PwaProvider";
import { SavedProvider } from "@/shared/components/SavedProvider";
import { ToastProvider } from "@/shared/components/Toast";
import { welcomeTick } from "@/shared/utils/welcomeTick";
import { useDeviceLocation } from "@/shared/utils/useDeviceLocation";

export function Providers({ children }: { children: ReactNode }) {
  useDeviceLocation();
  const pathname = usePathname();
  useEffect(welcomeTick, [pathname]); // every page change; the API only sends jobs whose run_at has passed
  return (
    <QueryProvider>
    <PwaProvider>
      <ToastProvider>
        <SavedProvider>
          <AuthProvider>
            {children}
            <PwaHandoff />
            <TripEndGate />
          </AuthProvider>
        </SavedProvider>
      </ToastProvider>
    </PwaProvider>
    </QueryProvider>
  );
}
