import { apiBaseUrl } from "@/shared/utils/apiBase";

export type HostApplicationInput = {
  name: string;
  phone: string;
  city: string;
  description: string;
};

/** "List with us" form. Throws with the API's message. */
export async function submitHostApplication(input: HostApplicationInput): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/v1/host-applications`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.ok) return;
  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  throw new Error(body?.error?.message ?? "That didn't go through. Try again in a moment.");
}
