import type { CSSProperties } from "react";

export const installPromptStyles = {
  bar: {
    position: "fixed",
    left: "50%",
    bottom: "max(var(--space-4), env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    width: "min(calc(100% - (var(--space-4) * 2)), var(--content-max))",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    padding: "var(--space-4)",
    background: "var(--surface-raised)",
    border: "1px solid var(--line-subtle)",
    borderRadius: "var(--space-4)",
    zIndex: "var(--z-toast)",
  },
  copy: {
    color: "var(--ink-primary)",
  },
  actions: {
    display: "flex",
    gap: "var(--space-2)",
    justifyContent: "flex-end",
  },
  primary: {
    minHeight: "var(--size-tap)",
    minWidth: "var(--size-tap)",
    paddingInline: "var(--space-5)",
    border: "none",
    borderRadius: "var(--radius-pill)",
    background: "var(--brand-primary)",
    color: "var(--brand-primary-on)",
    cursor: "pointer",
  },
  secondary: {
    minHeight: "var(--size-tap)",
    minWidth: "var(--size-tap)",
    paddingInline: "var(--space-5)",
    border: "1px solid var(--line-strong)",
    borderRadius: "var(--radius-pill)",
    background: "transparent",
    color: "var(--ink-primary)",
    cursor: "pointer",
  },
} as const satisfies Record<string, CSSProperties>;
