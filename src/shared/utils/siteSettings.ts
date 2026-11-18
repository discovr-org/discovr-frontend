/** Words and links the admin can change. Anything the admin leaves out falls back to these. */
export type SiteSettings = {
  tagline: string;
  searchPlaceholder: string;
  footerPromise: string;
  footerLinks: Array<{ label: string; href: string }>;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  tagline: "Goa, from people who know where to go",
  searchPlaceholder: "Search Goa",
  footerPromise: "discovr the best of what Goa has to offer",
  footerLinks: [
    { label: "Saved", href: "/saved" },
    { label: "Things to do in Goa", href: "/goa-for-you" },
    { label: "About us", href: "/about" },
    { label: "How we pick", href: "/how-we-pick" },
    { label: "List with us", href: "/list-with-us" },
    { label: "Help", href: "/help" },
  ],
};

export const withDefaults = (saved?: Partial<SiteSettings> | null): SiteSettings => ({
  ...DEFAULT_SITE_SETTINGS,
  ...Object.fromEntries(Object.entries(saved ?? {}).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))),
});
