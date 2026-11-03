import type { SVGProps } from "react";

/**
 * The Lucide glyphs this screen uses, inlined (the design system says: one set,
 * 24px grid, 2px stroke, round caps and joins, inline rather than a font or sprite).
 * Size comes from the parent's CSS; colour is currentColor.
 */
type P = SVGProps<SVGSVGElement>;

function Stroke({ children, strokeWidth = 2, ...rest }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const BackIcon = (p: P) => <Stroke {...p}><path d="M15 18 9 12l6-6" /></Stroke>;
export const ChevronRightIcon = (p: P) => <Stroke {...p}><path d="m9 18 6-6-6-6" /></Stroke>;
export const ChevronDownIcon = (p: P) => <Stroke {...p}><path d="m6 9 6 6 6-6" /></Stroke>;
export const ShareIcon = (p: P) => (
  <Stroke {...p}><path d="M12 16V4M8 8l4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></Stroke>
);
export const HeartIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  </Stroke>
);
export const RupeeIcon = (p: P) => (
  <Stroke {...p}><path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3M9 13c6.667 0 6.667-10 0-10" /></Stroke>
);
export const PinIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Stroke>
);
export const ArrowUpRightIcon = (p: P) => <Stroke {...p}><path d="M7 17 17 7M8 7h9v9" /></Stroke>;
export const ClockIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Stroke>
);
export const UsersIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </Stroke>
);
export const PhoneIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </Stroke>
);
export const NavigationIcon = (p: P) => <Stroke {...p}><path d="M3 11 22 2l-9 19-2-8-8-2Z" /></Stroke>;
export const InstagramIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
    <path d="M17.5 6.5h.01" />
  </Stroke>
);
export const CheckIcon = (p: P) => <Stroke {...p}><path d="M20 6 9 17l-5-5" /></Stroke>;
export const CrossIcon = (p: P) => <Stroke {...p}><path d="M18 6 6 18M6 6l12 12" /></Stroke>;
export const CompassIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" />
  </Stroke>
);
export const SearchIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4.3-4.3" />
  </Stroke>
);
export const MessageIcon = (p: P) => <Stroke {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></Stroke>;
export const UserIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Stroke>
);
export const AlertIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </Stroke>
);
export const WifiOffIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M2 8.8A16 16 0 0 1 22 8.8M5 12.9a11 11 0 0 1 14 0M8.5 16.9a6 6 0 0 1 7 0M12 20h.01M3 3l18 18" />
  </Stroke>
);
export const ZoomInIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
  </Stroke>
);
export const ZoomOutIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35M8 11h6" />
  </Stroke>
);
/** The small tick inside the verified badge, drawn heavier so it survives at 11px. */
export const TickIcon = (p: P) => <Stroke {...p}><path d="m5 13 4 4L19 7" /></Stroke>;
export const InfoIcon = (p: P) => <Stroke {...p}><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 7.8v.1" /></Stroke>;
export const VerifiedTickIcon = (p: P) => <Stroke strokeWidth={4} {...p}><path d="m5 13 4 4L19 7" /></Stroke>;
export const MinusIcon = (p: P) => (
  <Stroke strokeWidth={2.5} {...p}>
    <path d="M5 12h14" />
  </Stroke>
);
export const PlusIcon = (p: P) => (
  <Stroke strokeWidth={2.5} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Stroke>
);
/** Filled star for Rating — colour is ink-primary via currentColor. */
export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1Z" />
  </svg>
);
export const ListIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Stroke>
);
export const MapIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6Z" />
    <path d="M9 4v14M15 6v14" />
  </Stroke>
);
export const SlidersIcon = (p: P) => <Stroke {...p}><path d="M4 7h9M17 7h3M13 4.5v5M4 17h3M11 17h9M7 14.5v5" /></Stroke>;
