import type { Experience } from "@/types/experience";
import { kayakPolicy, thaliPolicy } from "@/features/experience/utils/samplePolicies";

/**
 * The listing shown in the design. Every host detail here is a placeholder:
 * replace the phone number, Instagram handle, coordinates and schedule with the real ones.
 */
export const sampleExperience: Experience = {
  slug: "night-kayak-mangroves",
  title: "Night kayak through the mangroves",
  host: {
    businessName: "Mangrove Trails",
    personName: "Priya",
    phone: "+919876543210",
    instagramHandle: "mangrovetrails.goa",
    avatar: { src: "/demo/host-priya.png", alt: "Priya" },
    verified: true,
    experienceCount: 84,
    languages: ["Konkani", "Hindi", "English"],
  },
  photos: [
    { src: "/demo/kayak-night.png", alt: "Kayaks in the dark, the water glowing green around the paddles" },
    { src: "/demo/setting-off.png", alt: "Setting off from the jetty at sunset" },
    { src: "/demo/jetty-dusk.png", alt: "The Siolim jetty at dusk" },
    { src: "/demo/back-on-the-bank.png", alt: "The group back on the bank under a lamp" },
  ],
  verdict:
    "The bioluminescence is real, and it's worth the mosquito bites. Go for 6:30, not 8, or you lose the last of the light on the way out.",
  price: { fromAmount: 1400, paidTo: "paid to the host" },
  place: { name: "Siolim jetty, North Goa", lat: 15.6236, lng: 73.7562, distance: "4 km away" },
  schedule: {
    Tue: ["6:30pm", "8pm"],
    Wed: ["6:30pm", "8pm"],
    Thu: ["6:30pm", "8pm"],
    Fri: ["6:30pm", "8pm", "9:30pm"],
    Sat: ["6:30pm", "8pm", "9:30pm"],
    Sun: ["6:30pm", "8pm"],
  },
  duration: "3 hours",
  groupSize: "up to 6 people",
  about:
    "Paddle out from the Siolim jetty after dark. Once your eyes adjust, the water lights up with every stroke. The guide keeps the group close and nobody needs to have kayaked before. You'll get splashed, so bring a change of clothes.",
  included: [
    { included: true, title: "Kayak, paddle and life jacket", detail: "Double kayaks, so you'll share with someone" },
    { included: true, title: "A guide who knows the tide tables", detail: "Priya or one of her two guides" },
    { included: false, title: "Not included: the ride to Siolim", detail: "Scooter parking at the jetty is free" },
  ],
  policy: kayakPolicy,
  reviews: {
    average: 4.8,
    count: 126,
    distribution: [93, 21, 8, 3, 1],
    items: [
      {
        id: "r1",
        name: "Aarav",
        context: "Last week · came solo",
        score: 5,
        body: "Went on the 8pm and it was fully dark by the time we got to the glowing bit. Priya pairs you up if you're alone, which I was. Mosquito spray is not optional.",
      },
      {
        id: "r2",
        name: "Sana",
        context: "2 weeks ago · group of 4",
        score: 4,
        body: "Four of us, two kayaks. The glow is brighter than the photos. The walk back from the jetty to the parking is unlit, so bring a torch or a phone with charge.",
      },
    ],
  },
};

/** A venue-hosted experience with a menu. Host details are placeholders. */
export const sampleThali: Experience = {
  slug: "goan-thali-assagao",
  title: "Goan thali dinner in an Assagao home",
  host: {
    businessName: "Maria's Kitchen",
    personName: "Maria",
    phone: "+919812345678",
    instagramHandle: "mariaskitchen.assagao",
    avatar: { src: "/demo/thali/host-maria.png", alt: "Maria" },
    verified: true,
    experienceCount: 62,
    languages: ["Konkani", "English", "Hindi"],
  },
  photos: [
    { src: "/demo/thali/thali-overhead.png", alt: "A steel thali seen from above: rice, fish curry, a fry, two bhajis and sol kadi" },
    { src: "/demo/thali/verandah-dusk.png", alt: "The verandah at dusk with the lamps on" },
    { src: "/demo/thali/curry-pot.png", alt: "Fish curry on the stove in a clay pot" },
  ],
  verdict:
    "Better than anything on the beach road, and Maria will notice if you don't finish. Ask for the sol kadi even if you think you don't like it.",
  price: { fromAmount: 1100, paidTo: "paid at the table", askForPrice: true },
  place: { name: "Assagao, North Goa", lat: 15.5937, lng: 73.7647, distance: "6 km away" },
  schedule: {
    Tue: ["7:30pm"],
    Wed: ["7:30pm"],
    Thu: ["7:30pm"],
    Fri: ["7:30pm"],
    Sat: ["7:30pm"],
    Sun: ["1pm", "7:30pm"],
  },
  duration: "2 hours",
  groupSize: "up to 8 people",
  about:
    "Dinner at Maria's family table in Assagao: whatever came off the boats that morning, cooked the way her mother did. It's a set thali, so there's nothing to order, and a vegetarian thali is always on. Tell her about allergies when you call.",
  included: [
    { included: true, title: "The full thali", detail: "Rice, curry, a fry and two bhajis. Second helpings are expected" },
    { included: true, title: "Sol kadi and something sweet", detail: "Bebinca on weekends" },
    { included: false, title: "Not included: drinks", detail: "Feni, urrak and beer from the menu, paid to Maria" },
  ],
  menu: {
    pages: [
      {
        src: "/demo/thali/menu-tonights-thali.jpg",
        label: "Tonight's thali",
        alt: "Tonight's thali: kingfish rava fry or prawns, ambot tik, red rice and fish curry, two bhajis, sol kadi. Included in your dinner.",
      },
      {
        src: "/demo/thali/menu-vegetarian.jpg",
        label: "Vegetarian",
        alt: "Vegetarian thali: mushroom xacuti, tondak, red rice and dal, two bhajis, sol kadi. Included in your dinner.",
      },
      {
        src: "/demo/thali/menu-drinks.jpg",
        label: "Drinks",
        alt: "Drinks: cashew feni ₹150, urrak ₹150 (March to May), kokum soda ₹80, beer ₹120, lime soda ₹60. Not included, paid to Maria at the table.",
      },
    ],
  },
  policy: thaliPolicy,
};

export const sampleListings = { kayak: sampleExperience, thali: sampleThali } as const;
export type SampleListing = keyof typeof sampleListings;
