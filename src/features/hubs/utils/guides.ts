/**
 * Answer-first copy for the guides people ask about. Keyed by hub slug.
 * Facts come from the live listings; re-check them when a listing changes and bump AS_OF.
 */
export type GuideRow = { slug: string; name: string; area: string; bestFor: string; price: string; hours: string };
export type Guide = {
  answer: string;
  rows: GuideRow[];
  faqs: { q: string; a: string }[];
};

export const AS_OF = "12 Nov 2026";

const R = {
  juna: { slug: "juna", name: "JUNA", area: "Anjuna", bestFor: "Cocktails, then a sound room", price: "Entry ₹700 (₹900 after 1am)", hours: "7pm–2am, weekends to 3:30am. Closed Tuesday" },
  raeeth: { slug: "raeeth", name: "RAEETH", area: "Vagator", bestFor: "Dinner, then house and techno", price: "From ₹3,000", hours: "7pm to about 4am. Party after 9pm" },
  loft: { slug: "the-loft-at-anamiva", name: "The Loft at Ānamiva", area: "Anjuna", bestFor: "A small room with a good sound system", price: "₹1,000 entry Fri and Sat", hours: "Events Fri and Sat from 9pm" },
  hideaway: { slug: "hideaway", name: "Hideaway", area: "Vagator", bestFor: "Live music over cocktails", price: "₹500 cover", hours: "7pm–1am. Closed Tuesday" },
  paloma: { slug: "paloma", name: "Paloma", area: "Anjuna", bestFor: "Rooftop sunset cocktails", price: "From ₹2,200", hours: "11:30am–12am daily" },
  pisco: { slug: "pisco-by-the-beach", name: "Pisco By The Beach", area: "Anjuna", bestFor: "Hammocks and a long sunset session", price: "Minimum spend depends on seating", hours: "12:30pm–12am daily" },
  slowTide: { slug: "slow-tide", name: "Slow Tide", area: "Anjuna", bestFor: "Sea-facing table on the rocks", price: "Cover and minimum spend vary, check when you book", hours: "11am–11:30pm daily" },
  bastian: { slug: "bastian-riviera", name: "Bastian Riviera", area: "Morjim", bestFor: "Riverside dinner after sunset", price: "From ₹3,000", hours: "8am–1am daily" },
  dds: { slug: "drop-dead-sexy", name: "Drop Dead Sexy", area: "Assagao", bestFor: "Inventive cocktails in a small art bar", price: "About ₹2,800 for two", hours: "From 9pm daily" },
  boilermaker: { slug: "boilermaker", name: "Boilermaker", area: "Siolim", bestFor: "Craft beer and cocktails, open air", price: "About ₹3,200 for two", hours: "From 6pm daily. Book ahead" },
  mtw: { slug: "mtw-bar-and-toasties", name: "MTW Bar & Toasties", area: "Panaji", bestFor: "Gin cocktails and toasties", price: "About ₹2,000 for two", hours: "7pm–1am, Mon–Sat" },
  cajy: { slug: "cajy-bar", name: "Cajy Bar", area: "Arpora", bestFor: "Feni and Goan food in a family tavern", price: "Depends on food and drinks", hours: "Evening into late, daily" },
  pablos: { slug: "pablos", name: "Pablo's", area: "Assagao", bestFor: "Feni and vinyl on the porch", price: "From ₹1,000 for two", hours: "5pm–1am. Closed Monday" },
  baga: { slug: "baga-mangrove-kayaking", name: "Baga mangrove kayaking", area: "Baga", bestFor: "Mangrove tunnels, easy to moderate", price: "₹300 a person", hours: "8am–7pm by appointment, about 1.5–2 hours" },
  palolem: { slug: "palolem-beach-kayaking", name: "Palolem beach kayaking", area: "Palolem", bestFor: "Coastal paddle in South Goa", price: "₹200 a person for 1 hour", hours: "6am–6pm, book by call" },
  surf: { slug: "surf-wala", name: "Surf Wala", area: "Arambol", bestFor: "Learning to surf", price: "₹3,000 a person a session", hours: "Daily, 8am and 10am slots" },
  wake: { slug: "101-wakepark", name: "101 Wakepark", area: "Arambol", bestFor: "Cable wakeboarding", price: "From ₹3,250 a person", hours: "8am–6pm by appointment, 1 hour" },
  padel: { slug: "coco-padel", name: "Coco Padel", area: "Assagao", bestFor: "A game of padel for 2–4", price: "From ₹1,000 court hire, half-hour minimum", hours: "7am–10:30pm, daily" },
  tattoo: { slug: "angel-tattoo", name: "Angel Tattoo", area: "Baga", bestFor: "A tattoo by appointment", price: "From ₹2,000, final price by artist", hours: "10am–1:30am by appointment" },
  bombil: { slug: "bombil", name: "Bombil", area: "Panaji", bestFor: "Fish thali, home-style", price: "About ₹500 for two", hours: "Lunch from noon, dinner from 7:30pm" },
};

export const GUIDES: Record<string, Guide> = {
  nightlife: {
    answer:
      "For a first night in North Goa, start at JUNA in Anjuna (cocktails in a bungalow courtyard, about 4 hours, entry ₹700) or RAEETH in Vagator (dinner, then house and techno, from about ₹3,000). For a smaller room and a real sound system, try The Loft at Ānamiva in Anjuna. Hideaway in Vagator is the small live-music bar. discovr lists only places the team has been to.",
    rows: [R.juna, R.raeeth, R.loft, R.hideaway],
    faqs: [
      { q: "Where should I go tonight in Anjuna?", a: "JUNA if you want cocktails first and a sound room later. It opens at 7pm and is closed on Tuesday. On a Friday or Saturday, The Loft at Ānamiva has its events from 9pm for ₹1,000 entry. Both are in Anjuna." },
      { q: "Which Goa club plays techno?", a: "RAEETH in Vagator. Dinner runs 7 to 9pm, then the party starts. Expect house and techno, not Bollywood. It closes around 4am. The Loft at Ānamiva in Anjuna also leans electronic on its Friday and Saturday nights." },
      { q: "Where can I hear live music in Vagator?", a: "Hideaway. It's a small cocktail bar with a ₹500 cover charge. Wednesday and Saturday are the live music nights. It's open 7pm to 1am and closed on Tuesday." },
    ],
  },
  "sunset-spots": {
    answer:
      "For sunset in North Goa, go to Paloma in Anjuna (rooftop sea views, from about ₹2,200, arrive around 5pm and book a table) or Pisco By The Beach in Anjuna (hammocks that fit three, and the DJ gets loud near sunset). Slow Tide is the rocky-shore pick in Anjuna. Bastian Riviera in Morjim is the riverside one, from about ₹3,000. discovr lists only places the team has been to.",
    rows: [R.paloma, R.pisco, R.slowTide, R.bastian],
    faqs: [
      { q: "What time should I arrive for sunset?", a: "Around 5pm. Paloma and Pisco By The Beach both suggest it. That gives you time to get a seat and order before the light goes. Paloma gets busy, so reserve a sunset table ahead." },
      { q: "Where can I get a hammock at sunset?", a: "Pisco By The Beach in Anjuna. A hammock fits up to three guests. Ask about availability when you book. The DJ can be loud around sunset, so it isn't the quiet pick." },
      { q: "Which sunset spot is quieter?", a: "Slow Tide, on the rocky shore in Anjuna. Ask for a sea-facing table and go in the late afternoon. Call ahead about entry, and allow a short walk from parking." },
    ],
  },
  cocktails: {
    answer:
      "For the best cocktails in Goa, go to Boilermaker in Siolim (open-air dive bar, about ₹3,200 for two, book ahead) or Drop Dead Sexy in Assagao (small art bar, about ₹2,800 for two, opens 9pm). For gin and a cheaper night, MTW Bar & Toasties in Panaji is about ₹2,000 for two. discovr lists only places the team has been to.",
    rows: [R.boilermaker, R.dds, R.mtw],
    faqs: [
      { q: "Where are the best cocktails in Assagao?", a: "Drop Dead Sexy. It's a small art bar opposite Sublime, open daily from 9pm. Expect to spend about ₹2,800 for two. The room is small, so enquire ahead if you are a group." },
      { q: "Do I need to book Boilermaker?", a: "Yes. Tables fill quickly. It opens at 6pm daily, and going early gives you a quieter start. It's an open-air bar in Siolim, with craft beer on tap. Plan on about ₹3,200 for two." },
      { q: "Where can I get cocktails in Panaji?", a: "MTW Bar & Toasties. It's an office-themed cocktail bar known for gin drinks. Open 7pm to 1am, Monday to Saturday. Walk in. About ₹2,000 for two." },
    ],
  },
  "local-bars": {
    answer:
      "For a local bar in Goa that isn't a tourist trap, go to Cajy Bar in Arpora (family-run Goan tavern, feni and home-cooked food, come in the evening) or Pablo's in Assagao (feni, vinyl on the porch, from ₹1,000 for two, 5pm to 1am, closed Monday). discovr lists only places the team has been to.",
    rows: [R.cajy, R.pablos],
    faqs: [
      { q: "What should I order at Cajy Bar?", a: "Cashew feni, tongue roast, admaas or stew. It's a self-service bar, so walk in or call ahead. Come in the evening and leave time for dinner. It's a family-run Goan tavern in Arpora." },
      { q: "When is Pablo's open?", a: "5pm to 1am, closed Mondays. It's in Assagao. Walk in or call. Plan on about ₹1,000 for two, though food and drinks vary. Go in the evening and stay past sunset." },
      { q: "What is feni?", a: "Goa's local spirit, distilled from cashew apple or coconut sap. Both Cajy Bar and Pablo's pour it. Cashew feni is the one to try first. Ask the bar how they like it served." },
    ],
  },
  kayaking: {
    answer:
      "For kayaking in Goa, go to Baga mangrove kayaking in North Goa (mangrove tunnels, ₹300 a person, about 1.5 to 2 hours, 8am to 7pm by appointment) or Palolem beach kayaking in South Goa (₹200 a person for 1 hour, 6am to 6pm). Book by call. Go in the morning or late afternoon. discovr lists only places the team has been to.",
    rows: [R.baga, R.palolem],
    faqs: [
      { q: "How long is mangrove kayaking in Baga?", a: "About 1.5 to 2 hours. It costs ₹300 a person. Kayaks, life jackets, instructor training, photos and videos are included. Book in advance by call. Half the amount is paid up front and is non-refundable." },
      { q: "What is the best time to kayak in Goa?", a: "Morning or late afternoon, when the heat eases. Baga runs 8am to 7pm by appointment. Palolem runs 6am to 6pm. Book by call in advance either way, as both work by appointment." },
      { q: "Where can I kayak in South Goa?", a: "Palolem beach, with Deva's Kayaks. It's ₹200 a person for a 1 hour session, open 6am to 6pm. Call or WhatsApp to book. Instructor training and life jackets are included." },
    ],
  },
  anjuna: {
    answer:
      "In Anjuna, go to Paloma or Pisco By The Beach for sunset (from about ₹2,200 at Paloma, arrive around 5pm), JUNA for cocktails and a sound room (entry ₹700, closed Tuesday), or The Loft at Ānamiva on a Friday or Saturday night (₹1,000 entry). Slow Tide is the rocky-shore table. discovr lists only places the team has been to.",
    rows: [R.paloma, R.pisco, R.slowTide, R.juna, R.loft],
    faqs: [
      { q: "Where is the best sunset in Anjuna?", a: "Paloma for rooftop sea views, or Pisco By The Beach for hammocks. Arrive around 5pm at either. Paloma is from about ₹2,200 and worth a reservation. Pisco's DJ gets loud near sunset." },
      { q: "Where should I go at night in Anjuna?", a: "JUNA for cocktails in a bungalow courtyard, then its sound room. It's open from 7pm, closed Tuesday. On Fridays and Saturdays, The Loft at Ānamiva runs events from 9pm for ₹1,000 entry." },
      { q: "Is Pisco By The Beach worth it?", a: "For sunset, yes. It's open 12:30pm to 12am daily, a hammock fits three, and the sea view is the point. It's loud when the DJ plays, so pick Slow Tide if you want quiet." },
    ],
  },
  vagator: {
    answer:
      "In Vagator, go to RAEETH for dinner and then house and techno (from about ₹3,000, opens 7pm, closes around 4am) or Hideaway for a small live-music cocktail bar (₹500 cover, live music on Wednesday and Saturday, closed Tuesday). discovr lists only places the team has been to.",
    rows: [R.raeeth, R.hideaway],
    faqs: [
      { q: "Where can I dance in Vagator?", a: "RAEETH. Dinner runs 7 to 9pm, then the party starts with house and techno. It closes around 4am. Thursday to Sunday after 9pm is the busy window, especially weekends." },
      { q: "Is there a cover at Hideaway?", a: "Yes, ₹500. Food and drinks are on top. Live music is on Wednesday and Saturday. It's open 7pm to 1am and closed on Tuesday. Walk in or call ahead." },
      { q: "What is a quiet night out in Vagator?", a: "Hideaway on a non-gig night. It's a small bar with a horseshoe counter and an open courtyard. You'll pay the ₹500 cover, then buy drinks. Wednesday and Saturday are the busier live nights." },
    ],
  },
  assagao: {
    answer:
      "In Assagao, go to Drop Dead Sexy for cocktails (small art bar, about ₹2,800 for two, from 9pm), Pablo's for feni and a porch (from ₹1,000 for two, 5pm to 1am, closed Monday), or Coco Padel for a game (from ₹1,000 court hire, 7am to 10:30pm). discovr lists only places the team has been to.",
    rows: [R.dds, R.pablos, R.padel],
    faqs: [
      { q: "Where are the best cocktails in Assagao?", a: "Drop Dead Sexy. It's a small art bar opposite Sublime, open daily from 9pm. Expect about ₹2,800 for two. Enquire ahead for a table if you are more than a few people." },
      { q: "Where can I play padel in Assagao?", a: "Coco Padel. Courts are open 7am to 10:30pm, every day. Court hire starts from ₹1,000 for 2 to 4 players, with a half-hour minimum. It's easy to pick up in one game." },
      { q: "Where is a local bar in Assagao?", a: "Pablo's. It's a neighbourhood tavern and skate hangout with feni and vinyl on the porch. Open 5pm to 1am, closed Mondays. Walk in or call. About ₹1,000 for two." },
    ],
  },
  arambol: {
    answer:
      "In Arambol, learn to surf with Surf Wala (₹3,000 a person a session, 8am or 10am slots, daily) or try cable wakeboarding at 101 Wakepark (from ₹3,250 a person, 1 hour, 8am to 6pm by appointment, book ahead). discovr lists only places the team has been to.",
    rows: [R.surf, R.wake],
    faqs: [
      { q: "Where can I learn to surf in Goa?", a: "Surf Wala in Arambol. A session is ₹3,000 a person and takes about 90 minutes. Slots are at 8am and 10am, every day. You learn to read the waves and stand up on the board." },
      { q: "Where can I go wakeboarding in Goa?", a: "101 Wakepark in Arambol, India's first cable wake park. It's from ₹3,250 a person for 1 hour, with solo and couple packages. Open 8am to 6pm by appointment, so book ahead." },
      { q: "Do I need to book in Arambol?", a: "Yes for both. Surf Wala runs two daily slots, at 8am and 10am. 101 Wakepark works by appointment between 8am and 6pm. Book a day or more ahead, especially at weekends." },
    ],
  },
  baga: {
    answer:
      "In Baga, go mangrove kayaking (₹300 a person, about 1.5 to 2 hours, 8am to 7pm by appointment, book by call) or get a tattoo at Angel Tattoo (from ₹2,000, 10am to 1:30am, by appointment only). discovr lists only places the team has been to.",
    rows: [R.baga, R.tattoo],
    faqs: [
      { q: "Is mangrove kayaking in Baga worth it?", a: "If you want quiet away from the beach crowds, yes. You paddle through mangrove tunnels for about 1.5 to 2 hours. It's ₹300 a person, and kayaks, life jackets and training are included." },
      { q: "How do I book a tattoo in Baga?", a: "Angel Tattoo works by appointment only, 10am to 1:30am, every day. Prices start from ₹2,000 and the final amount depends on the artist. Pick your own design and ask for a quote." },
      { q: "What is the best time to kayak in Baga?", a: "Morning or late afternoon, when the heat eases. Slots run 8am to 7pm by appointment. Call ahead to book. Half the booking amount is paid in advance to confirm your slot." },
    ],
  },
  panaji: {
    answer:
      "In Panaji, eat a fish thali at Bombil (about ₹500 for two, lunch from noon, dinner from 7:30pm, walk in, go at noon to beat the queue) and drink gin cocktails at MTW Bar & Toasties (about ₹2,000 for two, 7pm to 1am, Monday to Saturday). discovr lists only places the team has been to.",
    rows: [R.bombil, R.mtw],
    faqs: [
      { q: "Where can I get a fish thali in Panaji?", a: "Bombil, in Campal. It's a no-frills Goan eatery. Lunch starts at noon and dinner at 7:30pm. Fish changes daily, and seating is walk-in. Go at noon to get ahead of the queue." },
      { q: "Where can I get cocktails in Panaji?", a: "MTW Bar & Toasties. It's a cosy office-themed bar known for gin cocktails. Open 7pm to 1am, Monday to Saturday. Walk in. About ₹2,000 for two." },
      { q: "How much does a meal at Bombil cost?", a: "About ₹500 for two. Your fish choice changes the bill. There's no reservation, so just walk in. Fish availability varies daily, so the thali depends on the day's catch." },
    ],
  },
  "at-night": {
    answer:
      "For a night out in Goa, start with cocktails at Drop Dead Sexy in Assagao (about ₹2,800 for two) or Boilermaker in Siolim (about ₹3,200 for two, book ahead), then dance at RAEETH in Vagator (from about ₹3,000, until about 4am) or JUNA in Anjuna (entry ₹700). For a cheaper local night, Pablo's in Assagao or Cajy Bar in Arpora. discovr lists only places the team has been to.",
    rows: [R.dds, R.boilermaker, R.mtw, R.juna, R.raeeth, R.loft, R.hideaway, R.pablos, R.cajy],
    faqs: [
      { q: "What is there to do in Goa tonight?", a: "Cocktails first, then music. Drop Dead Sexy opens at 9pm. JUNA opens at 7pm and is closed Tuesday. RAEETH runs dinner then techno. The Loft at Ānamiva has events Friday and Saturday." },
      { q: "Where can I go late in Goa?", a: "RAEETH in Vagator closes around 4am. JUNA in Anjuna runs to 2am on weekdays and 3:30am on weekends. Drop Dead Sexy in Assagao opens at 9pm. Check the table above for each place's hours." },
      { q: "Where can I drink cheap in Goa?", a: "Pablo's in Assagao is from about ₹1,000 for two. Cajy Bar in Arpora is a family-run Goan tavern with feni and home-cooked food. Hideaway in Vagator has a ₹500 cover, then drinks." },
    ],
  },
};

export const GOA_ANSWER =
  "For a night out in Goa, start at JUNA or The Loft at Ānamiva in Anjuna, or RAEETH in Vagator. For sunset, Paloma or Pisco By The Beach in Anjuna. For cocktails, Boilermaker in Siolim or Drop Dead Sexy in Assagao. For something active, mangrove kayaking in Baga from ₹300, or surfing in Arambol from ₹3,000. discovr lists only places the team has been to.";

export const GOA_FAQS = [
  { q: "What should I do in Goa tonight?", a: "Cocktails at Drop Dead Sexy in Assagao or Boilermaker in Siolim, then music at JUNA in Anjuna or RAEETH in Vagator. For something earlier, catch sunset at Paloma in Anjuna around 5pm." },
  { q: "What are the best things to do in North Goa?", a: "Sunset at Paloma or Pisco By The Beach, nightlife at JUNA, RAEETH and The Loft, mangrove kayaking in Baga, and surfing or wakeboarding in Arambol. Pick by area on this page." },
  { q: "How does discovr pick places?", a: "Someone from the team has been to every place listed. Prices and hours are checked against the listing, and each place gets one honest verdict. We list a few good places, not hundreds." },
];
