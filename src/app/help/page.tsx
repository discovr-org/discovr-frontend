import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="app-shell">
      <h1 className="display-md">Help</h1>
      <p className="body-muted" style={{ marginTop: "var(--space-3)" }}>
        Something broken? Call or WhatsApp us from Contact us in the tab bar.
      </p>
      <p style={{ marginTop: "var(--space-4)" }}>
        <Link href="/">Back to explore</Link>
      </p>
    </div>
  );
}
