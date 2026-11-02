/**
 * Public API origin from env.
 * Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (dev) or the host’s env (Vercel/etc).
 * Empty → catalog callers may fall back to local seed.
 */
export function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function hasApiBaseUrl(): boolean {
  return apiBaseUrl().length > 0;
}
