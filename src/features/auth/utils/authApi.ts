import type { PhoneNumber } from "@/features/auth/components/AuthSheet";
import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

async function postJson<T>(
  path: string,
  body: unknown,
  sessionId?: string,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  if (!hasApiBaseUrl()) {
    throw new Error("Set NEXT_PUBLIC_API_BASE_URL to your API.");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`;

  const res = await fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Something went wrong. Try again.");
  }
  return data;
}

export async function requestOtp(phone: PhoneNumber): Promise<void> {
  await postJson("/v1/auth/otp/request", { phone: phone.e164 });
}

export async function verifyOtp(
  phone: PhoneNumber,
  code: string,
): Promise<{
  sessionId: string;
  userId: string;
  phoneE164: string;
  name: string | null;
  isNewUser: boolean;
}> {
  const data = await postJson<{
    sessionId: string;
    user: { id: string; phone: string; name?: string | null };
    isNewUser?: boolean;
  }>("/v1/auth/otp/verify", { phone: phone.e164, code });
  const name = data.user.name ?? null;
  return {
    sessionId: data.sessionId,
    userId: data.user.id,
    phoneE164: data.user.phone,
    name,
    isNewUser: data.isNewUser ?? !name,
  };
}

export async function saveName(sessionId: string, name: string): Promise<string> {
  const data = await postJson<{ user: { name: string } }>(
    "/v1/me",
    { name },
    sessionId,
    "PATCH",
  );
  return data.user.name;
}

export async function logoutSession(sessionId: string): Promise<void> {
  try {
    await postJson("/v1/auth/logout", {}, sessionId);
  } catch {
    // Local clear still wins if the network fails.
  }
}
