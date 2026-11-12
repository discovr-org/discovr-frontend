import type { Metadata } from "next";
import { ConsentSettings } from "@/features/legal/components/ConsentSettings";
import {
  LegalPage,
  LegalSectionBlock,
  type LegalSection,
} from "@/features/legal/components/LegalPage";

const DESCRIPTION = "What discovr collects, why, and what we never do with it.";

export const metadata: Metadata = {
  title: "Privacy",
  description: DESCRIPTION,
  alternates: { canonical: "https://discovr.in/legal/privacy" },
  openGraph: { title: "Privacy", description: DESCRIPTION, siteName: "discovr" },
  twitter: { card: "summary", title: "Privacy", description: DESCRIPTION },
};

const SECTIONS: LegalSection[] = [
  {
    title: "What we collect",
    paragraphs: [
      "When you browse: which pages you open and which buttons you tap, tied to an anonymous ID stored in a cookie on your device.",
      "When you sign up or sign in: your name and your phone number. We send a 6-digit code to that number on WhatsApp, or by SMS, to check it's yours.",
      "When you leave your number on a collection page or a campaign link, with no code: the number, your name if you give one, and where you left it. We use it only to message you about that.",
      "When you save, review or write to us: what you save, the reviews and photos you send, and the messages you write.",
      "When you subscribe in the footer: your WhatsApp number, for our newsletter. Every message has a link to stop it.",
      "Your location, only if you allow it. We ask once, after you scroll, and only when this device doesn't already have it. The spot stays on the device. When analytics is on, we send it to PostHog, because some browsers hide the real area.",
    ],
  },
  {
    title: "What we never collect",
    paragraphs: [
      "We never send your name or phone number to our analytics.",
    ],
  },
  {
    title: "Why",
    paragraphs: [
      "To show you what is close, to keep your saved things, to check reviews before they go up, to reply when you write to us, and to learn which pages help people. If you allowed location, we also learn which area you're in.",
    ],
  },
  {
    title: "Who sees it",
    paragraphs: [
      "The discovr team, and the service providers below, who only act on our instructions. When you tap a call button, the host sees nothing: your phone makes the call.",
    ],
  },
  {
    title: "Our service providers",
    paragraphs: [
      "Hosting: Vercel. Database: Supabase. Images: Cloudflare.",
      "Sign-in codes: Twilio, by SMS. The newsletter: Twilio, on WhatsApp. They see your phone number so they can deliver the message.",
      "Analytics, unless you turn it off (see below): PostHog.",
    ],
  },
  {
    title: "Analytics and replays",
    paragraphs: [
      "Analytics is on unless you turn it off below. If you turn it off, neither analytics tool above loads, and the site works exactly the same.",
      "While it is on, we count which pages you open and which buttons you tap, and we replay some visits (PostHog) to see where people get stuck. Everything you type is hidden in replays, including your number. We never send your name or phone number to these tools. They see an anonymous ID. If you allowed location, that spot is sent too.",
      "PostHog also notes errors the site runs into and how fast pages load, so we can fix them, and may now and then ask a one-question survey you can ignore.",
      "If you turn it off, that choice is kept on this device for 12 months. You can change it below at any time.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can edit your name and number, and delete your account, in Account. Deleting removes your lists straight away. Your phone number is anonymised after 30 days. Reviews you published stay up as \"a discovr user\".",
      "A number left without signing up is kept for 12 months unless you create an account with it. Ask us on the help page and we will delete it sooner, and stop messaging you.",
      "To ask us anything about your data, use the help page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" sections={SECTIONS}>
      <LegalSectionBlock id="analytics" title="Your analytics choice">
        <ConsentSettings />
      </LegalSectionBlock>
    </LegalPage>
  );
}
