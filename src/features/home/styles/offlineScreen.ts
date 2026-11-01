import type { CSSProperties } from "react";

export const offlineScreenStyles = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    paddingBlock: "var(--space-6)",
  },
  lead: {
    maxWidth: "36ch",
  },
} as const satisfies Record<string, CSSProperties>;
