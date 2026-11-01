"use client";

import { SerwistProvider } from "@serwist/next/react";
import type { ReactNode } from "react";

type PwaProviderProps = {
  children: ReactNode;
};

export function PwaProvider({ children }: PwaProviderProps) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      // Dev skips the SW so HMR stays quiet. Production always registers.
      disable={process.env.NODE_ENV === "development"}
    >
      {children}
    </SerwistProvider>
  );
}
