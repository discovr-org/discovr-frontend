"use client";

import type { ReactNode } from "react";
import { InstallPrompt } from "@/shared/components/InstallPrompt";
import { PwaProvider } from "@/shared/components/PwaProvider";
import { ToastProvider } from "@/shared/components/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PwaProvider>
      <ToastProvider>
        {children}
        <InstallPrompt />
      </ToastProvider>
    </PwaProvider>
  );
}
