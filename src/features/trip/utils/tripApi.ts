import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";
import type { Trip } from "@/features/trip/utils/trip";

const auth = (sessionId: string) => ({ Authorization: `Bearer ${sessionId}`, "Content-Type": "application/json" });

/** Their saved answer, or null if none. Throws if the API can't be reached, so callers can tell "none" from "unknown". */
export async function fetchTrip(sessionId: string): Promise<Trip | null> {
  if (!hasApiBaseUrl()) throw new Error("no api");
  const res = await fetch(`${apiBaseUrl()}/v1/auth/me`, { headers: auth(sessionId) });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { user?: { trip?: Trip | null } };
  return data.user?.trip ?? null;
}

export async function saveTrip(sessionId: string, trip: Trip): Promise<Trip | null> {
  if (!hasApiBaseUrl()) throw new Error("no api");
  const res = await fetch(`${apiBaseUrl()}/v1/me/trip`, {
    method: "PUT",
    headers: auth(sessionId),
    body: JSON.stringify({ status: trip.status, lastDay: trip.lastDay }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { user?: { trip?: Trip | null } };
  return data.user?.trip ?? null;
}
