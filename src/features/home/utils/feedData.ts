import { formatPrice } from "@/shared/utils/formatPrice";

export type FeedItem = {
  slug: string;
  title: string;
  placeLabel: string;
  imageSrc: string;
  imageAlt: string;
  blurb?: string;
  durationLabel?: string;
  priceInr?: number;
  priceSuffix?: string;
};

export type FeedSection = {
  id: string;
  title: string;
  /** portrait carousel vs full-width shortlist cards */
  density: "portrait" | "landscape";
  items: FeedItem[];
};

export const FEED_FILTERS = [
  "Tonight",
  "This weekend",
  "Near me",
  "Under ₹2,000",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

export function priceLabel(item: FeedItem): string | undefined {
  if (item.priceInr == null) return undefined;
  const base = `From ${formatPrice(item.priceInr)}`;
  return item.priceSuffix ? `${base} ${item.priceSuffix}` : base;
}

/** Sample feed shaped like the discovr.in recording. Photos reuse demo assets. */
export const feedSections: FeedSection[] = [
  {
    id: "sundowners",
    title: "The best sundowners of North Goa",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Pisco By The Beach",
        placeLabel: "Anjuna",
        imageSrc: "/demo/jetty-dusk.png",
        imageAlt: "Warm lights on a beach restaurant verandah at dusk",
        priceInr: 1400,
      },
      {
        slug: "goan-thali-assagao",
        title: "Slow Tide",
        placeLabel: "Anjuna",
        imageSrc: "/demo/thali/verandah-dusk.png",
        imageAlt: "Palm trees and a beach bar at golden hour",
        priceInr: 1600,
      },
      {
        slug: "goan-thali-assagao",
        title: "Bastian Riviera",
        placeLabel: "Morjim",
        imageSrc: "/demo/back-on-the-bank.png",
        imageAlt: "A riverside restaurant lit for sundown",
        priceInr: 1800,
      },
    ],
  },
  {
    id: "nightlife",
    title: "Nightlife",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Juna",
        placeLabel: "Anjuna",
        imageSrc: "/demo/kayak-night.png",
        imageAlt: "Warm wood ceiling lights in a night venue",
        priceInr: 1200,
      },
      {
        slug: "goan-thali-assagao",
        title: "Raeeth",
        placeLabel: "Vagator",
        imageSrc: "/demo/setting-off.png",
        imageAlt: "Blue-lit tropical foliage outside a club",
        priceInr: 1500,
      },
      {
        slug: "night-kayak-mangroves",
        title: "Hilltop",
        placeLabel: "Anjuna",
        imageSrc: "/demo/thali/curry-pot.png",
        imageAlt: "A late-night crowd under warm bulbs",
        priceInr: 1000,
      },
    ],
  },
  {
    id: "surf",
    title: "Surfing",
    density: "landscape",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Get Into The Waves At Surf Wala",
        placeLabel: "Arambol",
        imageSrc: "/demo/back-on-the-bank.png",
        imageAlt: "Someone paddling out into the Arabian Sea",
        blurb:
          "Learn to read the waves, find your balance, and ride the Arabian Sea with a surfing experience that's worth the early start.",
        durationLabel: "1 hour 30 min",
        priceInr: 3000,
      },
    ],
  },
  {
    id: "local-bars",
    title: "The OG local bars of Goa",
    density: "portrait",
    items: [
      {
        slug: "goan-thali-assagao",
        title: "Joseph Bar",
        placeLabel: "Panaji",
        imageSrc: "/demo/thali/curry-pot.png",
        imageAlt: "A local bar storefront at night",
        priceInr: 800,
      },
      {
        slug: "night-kayak-mangroves",
        title: "Cajy Bar",
        placeLabel: "Fontainhas",
        imageSrc: "/demo/thali/thali-overhead.png",
        imageAlt: "A small Goan bar with warm light",
        priceInr: 700,
      },
    ],
  },
  {
    id: "pottery",
    title: "Pottery",
    density: "landscape",
    items: [
      {
        slug: "goan-thali-assagao",
        title: "Mould Your Own Piece At Mati Earth Studio",
        placeLabel: "Mandrem",
        imageSrc: "/demo/thali/verandah-dusk.png",
        imageAlt: "A rustic studio with a hammock and clay work",
        blurb:
          "Shape clay using your hands and simple tools, slow down, and enjoy making a piece from start to finish.",
        durationLabel: "2 hours",
        priceInr: 1200,
      },
    ],
  },
  {
    id: "kayak",
    title: "Into the mangroves",
    density: "portrait",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Into the Wild Mangroves At Baga Kayaking",
        placeLabel: "Baga",
        imageSrc: "/demo/kayak-night.png",
        imageAlt: "A yellow kayak on dark water",
        priceInr: 300,
      },
    ],
  },
  {
    id: "tattoo",
    title: "Tattoo",
    density: "landscape",
    items: [
      {
        slug: "night-kayak-mangroves",
        title: "Ink From Your Goa Trip at Angel Tattoo",
        placeLabel: "Baga",
        imageSrc: "/demo/host-priya.png",
        imageAlt: "A tattoo studio with an artist at work",
        blurb: "A design you pick yourself, drawn by an artist and kept for life.",
        priceInr: 2000,
        priceSuffix: "+ taxes",
      },
    ],
  },
];
