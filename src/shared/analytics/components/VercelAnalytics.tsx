"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics. The admin editor's preview frames are not visitors, so they are left out, as Tag Manager does. */
export function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (new URL(event.url).pathname.startsWith("/preview") ? null : event)} />;
}
