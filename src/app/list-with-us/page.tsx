import type { Metadata } from "next";
import { ListWithUsPage } from "@/features/list-with-us/components/ListWithUsPage";

const LEAD =
  "Tell us what you run. If it sounds right, someone from the team will come and try it. You keep taking your own bookings.";

export const metadata: Metadata = {
  title: "List with us | discovr",
  description: LEAD,
  alternates: { canonical: "https://www.discovr.in/list-with-us" },
  openGraph: { title: "List with us", description: LEAD, siteName: "discovr" },
  twitter: { card: "summary", title: "List with us", description: LEAD },
};

export default function Page() {
  return <ListWithUsPage lead={LEAD} />;
}
