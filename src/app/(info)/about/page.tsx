import type { Metadata } from "next";
import { ABOUT_INTRO, AboutPage } from "@/features/about/components/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT_INTRO,
  alternates: { canonical: "https://discovr.in/about" },
  openGraph: { title: "About discovr", description: ABOUT_INTRO, siteName: "discovr" },
  twitter: { card: "summary", title: "About discovr", description: ABOUT_INTRO },
};

export default function Page() {
  return <AboutPage />;
}
