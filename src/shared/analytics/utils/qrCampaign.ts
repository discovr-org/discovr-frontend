/** Printed t-shirt QR. The code on the shirt is `/q/t`. */
export const TSHIRT_QR = {
  source: "tshirt",
  medium: "qr",
  campaign: "tshirt",
} as const;

const CAMPAIGN_KEY = "discovr.qr_campaign";
const SENT_KEY = "discovr.qr_campaign_sent";

/** Homepage URL PostHog can read. Query is removed after the first event. */
export function tshirtQrDestination(): string {
  const params = new URLSearchParams({
    utm_source: TSHIRT_QR.source,
    utm_medium: TSHIRT_QR.medium,
    utm_campaign: TSHIRT_QR.campaign,
  });
  return `/?${params.toString()}`;
}

export function isTshirtQrLanding(search: string): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return (
    params.get("utm_source") === TSHIRT_QR.source &&
    params.get("utm_medium") === TSHIRT_QR.medium &&
    params.get("utm_campaign") === TSHIRT_QR.campaign
  );
}

/** Keep the campaign until this device signs in, then stop copying it onto the next account. */
export function rememberQrCampaign(campaign: string): void {
  try {
    if (!window.localStorage.getItem(CAMPAIGN_KEY)) {
      window.localStorage.setItem(CAMPAIGN_KEY, campaign);
    }
  } catch {
    // Private mode can block storage. The visit is still tagged in PostHog.
  }
}

/** Campaign waiting to be saved on the person, once, at sign-in. */
export function pendingQrCampaign(): string | null {
  try {
    if (window.localStorage.getItem(SENT_KEY)) return null;
    return window.localStorage.getItem(CAMPAIGN_KEY);
  } catch {
    return null;
  }
}

export function markQrCampaignSent(): void {
  try {
    window.localStorage.setItem(SENT_KEY, "1");
  } catch {
    // Ignore. The next sign-in will try again.
  }
}

/** Drop the campaign query so a shared homepage link is not counted as a shirt scan. */
export function stripTshirtUtms(): void {
  if (!isTshirtQrLanding(window.location.search)) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("utm_source");
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}
