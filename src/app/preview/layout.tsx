import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin editor's live preview. Not a page anyone should find.
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
