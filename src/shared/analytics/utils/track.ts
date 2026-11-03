import posthog from "posthog-js";
import type { EventMap } from "./events";
import { analyticsActive } from "./posthog";

/** Send one custom event from the typed list. Quietly does nothing when analytics is off. */
export function track<E extends keyof EventMap>(event: E, props: EventMap[E]): void {
  if (!analyticsActive()) return;
  posthog.capture(event, props);
}
