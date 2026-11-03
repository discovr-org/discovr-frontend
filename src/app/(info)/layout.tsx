import type { ReactNode } from "react";
import { InfoShell } from "@/shared/components/InfoShell";

export default function InfoLayout({ children }: { children: ReactNode }) {
  return <InfoShell>{children}</InfoShell>;
}
