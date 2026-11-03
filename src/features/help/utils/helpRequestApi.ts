import { apiBaseUrl } from "@/shared/utils/apiBase";

export type HelpRequestInput = {
  category: string;
  message: string;
  name: string;
  phone: string;
};

/** Help page form. Throws with the API's message. */
export async function submitHelpRequest(input: HelpRequestInput): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/v1/help-requests`, {
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
