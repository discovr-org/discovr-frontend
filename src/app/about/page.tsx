import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="app-shell">
      <h1 className="display-md">About us</h1>
      <p className="body-muted" style={{ marginTop: "var(--space-3)" }}>
        Eight things worth doing tonight, not eight hundred. We&apos;ve been to
        all of them.
      </p>
      <p style={{ marginTop: "var(--space-4)" }}>
        <Link href="/">Back to explore</Link>
      </p>
    </div>
  );
}
