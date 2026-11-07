import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/components/LegalPage";

const DESCRIPTION =
  "discovr doesn't take bookings or payments for the experiences on it. Hosts do. Here's what that means for you.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: DESCRIPTION,
  alternates: { canonical: "https://discovr.in/legal/disclaimer" },
  openGraph: { title: "Disclaimer", description: DESCRIPTION, siteName: "discovr" },
  twitter: { card: "summary", title: "Disclaimer", description: DESCRIPTION },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Who runs what",
    paragraphs: [
      "Every experience on discovr is run by a host. The host sets the price, takes the booking and takes the payment. discovr isn't part of the booking or the payment.",
      "When you tap a booking button, we send you to the host or their booking site. From that point the booking is between you and them.",
    ],
  },
  {
    title: "What we do vouch for",
    paragraphs: [
      "We go to an experience before it goes on discovr. We vouch for what we saw on the day we went, and the page says when that was.",
      "Things change. A price, a time or a meeting point can be different by the time you book. Check them with the host before you pay.",
    ],
  },
  {
    title: "Prices",
    paragraphs: [
      "Prices are the host's prices, with the date we last checked them. If a price is more than a month old, the page says so.",
    ],
  },
  {
    title: "If something goes wrong",
    paragraphs: [
      "Tell us on the help page. We can't refund money we didn't take, but we will take it up with the host, and we remove hosts who treat people badly.",
      "If you're in danger, call 112 first.",
    ],
  },
];

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" sections={SECTIONS} />;
}
