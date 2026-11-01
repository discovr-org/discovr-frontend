import Link from "next/link";

export default function HowWePickPage() {
  return (
    <div className="app-shell">
      <h1 className="display-md">How we pick</h1>
      <p className="body-muted" style={{ marginTop: "var(--space-3)" }}>
        We go. If we can&apos;t say why it&apos;s on the list, it isn&apos;t.
      </p>
      <p style={{ marginTop: "var(--space-4)" }}>
        <Link href="/">Back to explore</Link>
      </p>
    </div>
  );
}
