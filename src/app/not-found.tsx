"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Any unknown URL (or missing listing) sends the visitor to the home page.
// Done in the browser: the server still answers 404, so search engines drop dead URLs
// instead of treating the home page as a copy of every broken link.
export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <p style={{ padding: "var(--space-6, 24px)" }}>
      That page isn&apos;t here. <Link href="/">Taking you home</Link>.
    </p>
  );
}
