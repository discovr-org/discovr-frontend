import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/features/legal/components/LegalPage";
import styles from "@/features/legal/styles/legalPage.module.css";

const LEAD =
  "discovr lists things to do in Goa that someone from our team has been to. That's the whole rule.";

export const metadata: Metadata = {
  title: "How we pick",
  description: LEAD,
  alternates: { canonical: "https://discovr.in/how-we-pick" },
  openGraph: { title: "How we pick", description: LEAD, siteName: "discovr" },
  twitter: { card: "summary", title: "How we pick", description: LEAD },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Who goes",
    paragraphs: [
      'A member of the discovr team visits every experience, usually as a paying guest. The page says when we went, like "We went in Sep 2026".',
    ],
  },
  {
    title: "What we turn down",
    paragraphs: [
      "We turn down anything we haven't been to, anything we wouldn't recommend to a friend, and anything where the host can't tell us what you'll actually get. Being popular doesn't get a place on the list.",
      "Some experiences we visit never go up.",
    ],
  },
  {
    title: "How verdicts are written",
    paragraphs: [
      "Every listing has one line from the person who went: what makes it worth an evening, or what to know before going. It can be unflattering. We don't write one for a place nobody visited.",
    ],
  },
  {
    title: "How prices are checked",
    paragraphs: [
      "Prices are the host's prices. We check each one at least every 30 days and show the date we checked. If a check is over a month old, the page says so and we take the listing out of search until it's checked again.",
    ],
  },
  {
    title: "How bookings work",
    paragraphs: [
      "You book directly with the host, on their site or by phone. discovr doesn't take payments or a cut of the price you pay the host.",
    ],
  },
  {
    title: "How reviews are checked",
    paragraphs: [
      "A review needs 2 to 6 photos taken there. A person on our team reads every review and looks at every photo before it goes up. We strip location data from photos before they're shown.",
    ],
  },
];

export default function HowWePickPage() {
  return (
    <LegalPage title="How we pick" lead={LEAD} sections={SECTIONS} draft={false}>
      <p className={styles.footnote}>
        New here? <Link href="/about">About discovr</Link>
      </p>
    </LegalPage>
  );
}
