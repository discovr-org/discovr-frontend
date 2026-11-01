/** Bottom-up scrim toward surface-canvas so a feed of unrelated photos shares a base. */
export const photoLift = {
  backgroundImage:
    "linear-gradient(to top, color-mix(in srgb, var(--surface-canvas) 70%, transparent), transparent)",
} as const;
