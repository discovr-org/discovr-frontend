import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";

type SavesResponse = { slugs: string[] };

async function authJson<T>(
  method: string,
  path: string,
  sessionId: string,
  body?: unknown,
): Promise<T | null> {
  if (!hasApiBaseUrl()) return null;
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${sessionId}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchRemoteSaves(
  sessionId: string,
): Promise<string[] | null> {
  const data = await authJson<SavesResponse>("GET", "/v1/me/saves", sessionId);
  return data?.slugs ?? null;
}

/** Push local guest saves to the DB (replace full set). */
export async function syncSavesToRemote(
  sessionId: string,
  slugs: string[],
): Promise<string[] | null> {
  const data = await authJson<SavesResponse>("PUT", "/v1/me/saves", sessionId, {
    slugs,
  });
  return data?.slugs ?? null;
}

export async function putRemoteSave(
  sessionId: string,
  slug: string,
): Promise<boolean> {
  const data = await authJson<{ slug?: string }>(
    "PUT",
    `/v1/me/saves/${encodeURIComponent(slug)}`,
    sessionId,
  );
  return Boolean(data?.slug);
}

export async function deleteRemoteSave(
  sessionId: string,
  slug: string,
): Promise<boolean> {
  const data = await authJson<{ ok?: boolean }>(
    "DELETE",
    `/v1/me/saves/${encodeURIComponent(slug)}`,
    sessionId,
  );
  return Boolean(data?.ok);
}
