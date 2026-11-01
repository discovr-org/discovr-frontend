import Link from "next/link";

export default function ListWithUsPage() {
  return (
    <div className="app-shell">
      <h1 className="display-md">List with us</h1>
      <p className="body-muted" style={{ marginTop: "var(--space-3)" }}>
        Host in Goa? Tell us what you run. We only list what we&apos;ve been to.
      </p>
      <p style={{ marginTop: "var(--space-4)" }}>
        <Link href="/">Back to explore</Link>
      </p>
    </div>
  );
}
