import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";
import type { SessionUser } from "@/features/auth/utils/session";

/** A one-use code the installed app can swap for its own session. Needs a signed-in session. */
export async function fetchHandoffCode(sessionId: string): Promise<string> {
  if (!hasApiBaseUrl()) throw new Error("no api");
  const res = await fetch(`${apiBaseUrl()}/v1/auth/handoff`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionId}` },
  });
  if (!res.ok) throw new Error(String(res.status));
  return ((await res.json()) as { code: string }).code;
}

/** Swap a code for a new session. Throws if the code is used up, expired or wrong. */
export async function exchangeHandoffCode(code: string): Promise<SessionUser> {
  if (!hasApiBaseUrl()) throw new Error("no api");
  const res = await fetch(`${apiBaseUrl()}/v1/auth/handoff/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as {
    sessionId: string;
    user: { id: string; phone: string; name?: string | null; createdAt?: string };
  };
  return {
    phoneE164: data.user.phone,
    sessionId: data.sessionId,
    userId: data.user.id,
    name: data.user.name ?? undefined,
    createdAt: data.user.createdAt,
  };
}
