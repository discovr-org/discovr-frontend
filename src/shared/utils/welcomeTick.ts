import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";

/** Tells the API the app is open, so it can send any welcome messages that are due. Fire and forget; called on every page change. */
export function welcomeTick() {
  if (!hasApiBaseUrl()) return;
  fetch(`${apiBaseUrl()}/v1/welcome/run`, { method: "POST", keepalive: true }).catch(() => {});
}
