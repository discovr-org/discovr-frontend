import { apiBaseUrl } from "./apiBase";

/** Footer "Keep me posted": stores a WhatsApp number. Throws with the API's message. */
export async function subscribeTripUpdates(phone: string, source: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/v1/trip-updates`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, source }),
  });
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  throw new Error(body?.error?.message ?? "That didn't go through. Try again in a moment.");
}
