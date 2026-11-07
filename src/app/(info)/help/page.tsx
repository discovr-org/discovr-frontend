import type { Metadata } from "next";
import { HelpPage } from "@/features/help/components/HelpPage";

const DESCRIPTION = "Call, WhatsApp or write to the discovr team.";

export const metadata: Metadata = {
  title: "Help and contact",
  description: DESCRIPTION,
  alternates: { canonical: "https://discovr.in/help" },
  openGraph: { title: "Help and contact", description: DESCRIPTION, siteName: "discovr" },
  twitter: { card: "summary", title: "Help and contact", description: DESCRIPTION },
};

export default function Page() {
  return <HelpPage />;
}
