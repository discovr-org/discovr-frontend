/**
 * Public API origin from env.
 * Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (dev) or the host’s env (Vercel/etc).
 * Required for catalog UI — empty means no API.
 */
export function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function hasApiBaseUrl(): boolean {
  return apiBaseUrl().length > 0;
}
