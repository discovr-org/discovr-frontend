import { offlineScreenStyles } from "@/features/home/styles/offlineScreen";

export function OfflineScreen() {
  return (
    <section style={offlineScreenStyles.root} aria-labelledby="offline-title">
      <p className="caption" style={{ color: "var(--ink-subtle)" }}>
        Offline
      </p>
      <h1 id="offline-title" className="display-md">
        No signal right now.
      </h1>
      <p className="body-muted" style={offlineScreenStyles.lead}>
        Your tickets stay on this phone once you&apos;ve booked. Everything else
        waits until you&apos;re back online.
      </p>
    </section>
  );
}
