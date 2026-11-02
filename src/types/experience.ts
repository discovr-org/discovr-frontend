import type { Policy } from "@/shared/components/PolicyDisclosure";

/** Everything the experience detail screen needs, in one object. */
export interface Experience {
  slug: string;
  title: string;
  host: Host;
  /** 4 to 8 photos. The first one is the cover and loads with priority. */
  photos: Photo[];
  /** One or two sentences in discovr's voice, from someone who went. No surrounding quotes. */
  verdict: string;
  price: Price;
  place: Place;
  /** Trip times for each weekday. Missing days mean "No trips". */
  schedule: WeekSchedule;
  /** e.g. "3 hours" */
  duration: string;
  /** e.g. "up to 6 people" */
  groupSize: string;
  /** Plain paragraph for the About section. */
  about: string;
  included: IncludedItem[];
  /** Only for experiences hosted at a restaurant, bar or home kitchen. Omit and the Menu section doesn't render. */
  menu?: Menu;
  /** Booking and cancellation terms. Omit and the card doesn't render. */
  policy?: Policy;
  /** Reviews for the detail screen. Most recent first. */
  reviews?: ExperienceReviews;
  /** Venue / sheet hours when the API stores ListingSchedule instead of a week grid. */
  hours?: ListingHours;
  tags?: string[];
  content?: ExperienceContent;
}

export type ListingHours = {
  days?: string;
  timeSlot?: string;
  bestTime?: string;
  ageGroup?: string;
  minPeople?: string;
  durationLabel?: string;
};

export type ContentLink = { label: string; url: string };

/** Extra sheet fields from the catalog API. */
export type ExperienceContent = {
  aka?: string;
  locationLabel?: string;
  priceNarrative?: string;
  priceUnit?: string;
  meetingPoint?: string;
  droppingPoint?: string;
  durationLabel?: string;
  additionalInfo?: string;
  termsDetail?: string;
  whatToCarry?: string;
  included?: string[];
  notIncluded?: string[];
  phones?: string[];
  languages?: string[];
  maxPeople?: string;
  distance?: string;
  difficulty?: string;
  tagsOnDisplay?: string[];
  faqs?: Array<{ q: string; a: string }>;
  links?: {
    maps?: ContentLink;
    book?: ContentLink;
    whatsapp?: ContentLink;
    instagram?: ContentLink;
    menu?: ContentLink;
  };
};

export interface ExperienceReviews {
  average: number;
  count: number;
  /** Counts for scores 5 → 1. */
  distribution: [number, number, number, number, number];
  /** Most recent first; detail shows the first two. */
  items: ExperienceReview[];
}

export interface ExperienceReview {
  id: string;
  name: string;
  context: string;
  score: number;
  body: string;
  avatarSrc?: string;
}

export type { Policy };

export interface Menu {
  /** Photos of the venue's real menu, in reading order. The first one is the cover shown in the page. */
  pages: MenuPage[];
}

export interface MenuPage {
  /** A photo of the page, 3:4, at least 1440px wide so the 200% zoom stays sharp. */
  src: string;
  /** Short name of the page, shown in the reader: "Tonight's thali", "Drinks" */
  label: string;
  /** What the page says, for screen readers. If the menu is short, its text. */
  alt: string;
}

export interface Host {
  /** Business name shown in the byline, e.g. "Mangrove Trails" */
  businessName: string;
  /** The person who picks up, e.g. "Priya" */
  personName: string;
  /** E.164, e.g. "+919876543210". Used for Call and Call to book. */
  phone: string;
  /** Without the @ */
  instagramHandle?: string;
  /** Square photo of the host. Falls back to initials if absent. */
  avatar?: Photo;
  verified: boolean;
  /** Shown in the host row when known, e.g. 84. */
  experienceCount?: number;
  /** e.g. ["Konkani", "Hindi", "English"] */
  languages: string[];
}

export interface Photo {
  src: string;
  /** Describe what is happening in the photo, not the listing name. */
  alt: string;
}

export interface Price {
  /** Lowest per-person price in rupees, all-in. Ignored when askForPrice is true. */
  fromAmount: number;
  /** Who gets paid, shown next to the price in the key details. */
  paidTo: string; // e.g. "paid to the host"
  /**
   * Venue / walk-in listings with no published tariff.
   * BookingBar says "Ask for the price" and Call dials the host.
   */
  askForPrice?: boolean;
}

export interface Place {
  /** e.g. "Siolim jetty, North Goa" */
  name: string;
  /** Exact pin. Opened in Google Maps from the key details and the Directions tile. */
  lat: number;
  lng: number;
  /** Only when you have the user's location, e.g. "4 km away". Omit otherwise. */
  distance?: string;
}

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
/** Times as written in the UI, e.g. ["6:30pm", "8pm"]. */
export type WeekSchedule = Partial<Record<Weekday, string[]>>;

export interface IncludedItem {
  included: boolean;
  title: string;
  detail?: string;
  /** e.g. a refund line in state-positive. */
  detailTone?: "positive";
}

/** The screen states the design covers. */
export type ScreenState = "populated" | "loading" | "offline" | "error";
