import type { Policy } from "@/shared/components/PolicyDisclosure";

/* The two policies from the design. They are placeholders written in discovr's voice:
   replace them with each host's real terms before launch. */

export const kayakPolicy: Policy = {
  summary: "Free cancellation until 6pm on the day",
  booking: [
    "Book by calling or WhatsApping Mangrove Trails. Payments don't go through discovr.",
    "Your spot is held once Priya confirms the time on the call.",
    "Pay Priya at the jetty, in cash or UPI. ₹1,400 per person, nothing on top.",
    "13 and over. Under-18s come with an adult.",
  ],
  cancellation: [
    "Free cancellation until 6pm on the day. Call or WhatsApp Priya to cancel.",
    "After 6pm, still let her know. A held spot is one she can't give to someone else.",
    "If the tide or the weather makes it unsafe, she cancels and moves you to another night.",
  ],
};

export const thaliPolicy: Policy = {
  summary: "Free cancellation until 4pm on the day",
  booking: [
    "Book by calling or WhatsApping Maria by 4pm on the day. She cooks for the number booked.",
    "Tell her about allergies, and if anyone wants the vegetarian thali, when you call.",
    "Pay Maria at the table, in cash or UPI. ₹1,100 per person; drinks are extra.",
  ],
  cancellation: [
    "Free cancellation until 4pm on the day. Call or WhatsApp Maria to cancel.",
    "After 4pm she has already shopped and cooked for you, so she asks for ₹500 per person.",
    "Running late is fine. Dinner waits up to 30 minutes.",
  ],
};
