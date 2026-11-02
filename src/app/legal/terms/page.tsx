import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/features/legal/components/LegalPage";

const DESCRIPTION = "The rules for using discovr.";

export const metadata: Metadata = {
  title: "Terms | discovr",
  description: DESCRIPTION,
  alternates: { canonical: "https://www.discovr.in/legal/terms" },
  openGraph: { title: "Terms", description: DESCRIPTION, siteName: "discovr" },
  twitter: { card: "summary", title: "Terms", description: DESCRIPTION },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Using discovr",
    paragraphs: [
      "discovr is a guide to experiences in Goa. You can read it without signing up. Saving things and writing reviews needs a name and phone number.",
      "Give us your own details. Don't use someone else's number.",
    ],
  },
  {
    title: "Bookings",
    paragraphs: [
      "Bookings and payments are between you and the host. See the disclaimer. discovr isn't a party to them.",
    ],
  },
  {
    title: "Reviews and photos",
    paragraphs: [
      "A review needs photos you took there, and we check every one before it goes up. You keep the rights to your photos and give us permission to show them on discovr.",
      "We don't publish reviews that are abusive, off topic, or not about an experience you went to.",
    ],
  },
  {
    title: "Our content",
    paragraphs: [
      "The verdicts, descriptions and photos we make belong to discovr. Quote us, link to us, but don't copy whole pages.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may change these terms. The date at the top of this page says when they last changed.",
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms" sections={SECTIONS} />;
}
