import Link from "next/link";
import { homeFeedStyles } from "@/features/home/styles/homeFeed";

export function HomeFeed() {
  return (
    <section style={homeFeedStyles.root} aria-labelledby="home-title">
      <p className="caption" style={{ color: "var(--ink-subtle)" }}>
        Tonight in Goa
      </p>
      <h1 id="home-title" className="display-md">
        Goa, from people who actually go out.
      </h1>
      <p className="body-muted" style={homeFeedStyles.lead}>
        Eight things worth doing tonight, not eight hundred. We&apos;ve been to
        all of them.
      </p>
      <p className="body" style={{ marginTop: "var(--space-5)" }}>
        <Link href="/experiences/kayak?demo=1">Open night kayak (demo)</Link>
      </p>
    </section>
  );
}
