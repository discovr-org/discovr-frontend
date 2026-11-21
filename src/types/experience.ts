import type { Policy } from "@/shared/components/PolicyDisclosure";

/** Everything the experience detail screen needs, in one object. */
export interface Experience {
  slug: string;
  title: string;
  /** `null` for a place with no host. */
  host: Host | null;
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
  /** Set when the listing uses a category: the page layout it shares, filled from this listing's fields. */
  category?: { slug: string; name: string; layout: CategoryLayout };
}

/** A category's page layout. Story blocks name the listing field they fill (`source`). */
export type CategoryLayout = {
  /** Which buttons the Action buttons row shows, in order. */
  actionButtons?: Array<"call" | "directions" | "instagram" | "whatsapp" | "website" | "share">;
  sections?: Array<{ id: string; show?: boolean }>;
  story?: LayoutBlock[];
};

/** `when`: show the block only if this listing field is filled (for headings and dividers that belong to a section). */
export type LayoutBlock = { show?: boolean; when?: string } & (
  | { type: "heading"; level: "section" | "small"; text?: string; source?: string }
  | { type: "line" }
  | { type: "part"; id: "title" | "info" | "verdict" | "actions" | "menu" | "policy" | "host" | "reviews" }
  | { type: "text"; label?: string; text?: string; source?: string }
  | { type: "quote"; text?: string; source?: string }
  | { type: "checklist"; title: string; source: string }
  | { type: "forNotFor"; columns: Array<{ title: string; tone: "included" | "bring"; source: string }> }
  | { type: "callout"; tone: "heads_up" | "tip"; title: string; text?: string; source?: string }
  | { type: "faq"; source?: string }
  | { type: "steps"; source?: string }
  | { type: "stats"; tiles: Array<{ label: string; source: string }> }
  | { type: "packages"; title?: string; source?: string }
  | { type: "photo"; source: string }
);

export type ListingHours = {
  days?: string;
  timeSlot?: string;
  /** Days with their own hours (e.g. weekends), shown with `altTimeSlot`. */
  altDays?: Weekday[];
  altTimeSlot?: string;
  closedDays?: Weekday[];
  bestTime?: string;
  ageGroup?: string;
  minPeople?: string;
  durationLabel?: string;
  difficulty?: string;
};

export type ContentLink = { url: string; label?: string };

/** Extra sheet fields from the catalog API. */
export type ExperienceContent = {
  aka?: string;
  locationLabel?: string;
  priceNarrative?: string;
  priceUnit?: string;
  /** "+ taxes" vs "inclusive of taxes" on the guest price line. */
  taxes?: PriceTaxes;
  /** trip = schedule + people; venue = bar/restaurant (no trip times / people). */
  format?: "trip" | "venue";
  meetingPoint?: string;
  droppingPoint?: string;
  durationLabel?: string;
  additionalInfo?: string;
  termsDetail?: string;
  whatToCarry?: string;
  /** Places: adds "No booking needed, just walk in" to the bottom bar. */
  walkIn?: boolean;
  /** Italic one-liner at the top of About. */
  pitch?: string;
  fitnessLevel?: string;
  /** e.g. "1 instructor for 4 students" */
  instructorRatio?: string;
  /** Yellow Health advisory box. */
  healthAdvisory?: string;
  /** "Things to get with you" checklist. */
  carry?: string[];
  /** "Know before you go" tips. Falls back to the policy lines. */
  knowBeforeYouGo?: string[];
  included?: string[];
  notIncluded?: string[];
  phones?: string[];
  languages?: string[];
  maxPeople?: string;
  distance?: string;
  difficulty?: string;
  tagsOnDisplay?: string[];
  faqs?: Array<{ q: string; a: string }>;
  /** Story fields a category layout can show: photos, process steps, price rows. */
  storyPhotos?: Array<{ src: string; alt?: string; caption?: string }>;
  steps?: Array<{ marker?: string; title: string; caption?: string }>;
  packages?: Array<{ name: string; detail?: string; price: string }>;
  /** The About story, in reading order. When absent the page builds one from the fields above. */
  blocks?: StoryBlock[];
  /** Order and visibility of the page parts, set in the admin. Missing = the default page. */
  sections?: Array<{ id: string; show?: boolean }>;
  /** "link" = the button opens `links.book` as "Book on <host>"; "custom" = same URL with `bookLabel`; otherwise it calls. */
  bookVia?: "call" | "link" | "custom";
  /** The label on the custom button. */
  bookLabel?: string;
  /** Replaces the left text of the booking bar ("From ₹300"). Empty = the price. */
  barText?: string;
  /** Small line under it. Empty = the unit ("per person"). */
  barNote?: string;
  /** true = skip photo blocks in the story. */
  hideStoryPhotos?: boolean;
  links?: {
    maps?: ContentLink;
    book?: ContentLink;
    whatsapp?: ContentLink;
    instagram?: ContentLink;
    website?: ContentLink;
    menu?: ContentLink;
  };
  /** Which buttons the Action buttons row shows, in order. Missing = Call, Directions, Instagram, Share. */
  actionButtons?: Array<"call" | "directions" | "instagram" | "whatsapp" | "website" | "share">;
};

/** Set by the admin page builder. `show: false` hides the block. */
export type StoryBlockFlags = {
  show?: boolean;
};

export type StoryBlock = StoryBlockFlags &
  (
  | { type: "heading"; level: "section" | "small"; text: string }
  | { type: "line" }
  | { type: "part"; id: "title" | "info" | "verdict" | "actions" | "menu" | "policy" | "host" | "reviews" }
  | { type: "quote"; text: string; plain?: boolean; cite?: string }
  /** `strong` paragraphs are labels ("Age"), the plain ones under them are values. */
  | { type: "text"; paragraphs: Array<{ text: string; strong?: boolean }> }
  | { type: "photo"; src: string; alt: string; caption?: string }
  | {
      type: "forNotFor";
      columns: Array<{ title: string; tone: "included" | "bring"; items: string[] }>;
    }
  | { type: "steps"; items: Array<{ marker: string; title: string; caption?: string }> }
  | { type: "callout"; tone: "heads_up" | "tip"; title: string; paragraphs: string[] }
  | { type: "checklist"; title: string; items: string[] }
  | { type: "faq"; items: Array<{ q: string; a: string }> }
  /** Small tiles, e.g. Age / Fitness level. */
  | { type: "stats"; items: Array<{ label: string; value: string }> }
  /** Price rows. `price` is the amount in rupees, as typed. */
  | { type: "packages"; title?: string; items: Array<{ name: string; detail?: string; price: string }> }
  );

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

/** How we credit the place on the detail screen. */
export type HostCredit = "hosted" | "run" | "owned";

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
  /** "Hosted by" / "Run by" / "Owned by". Defaults to hosted. */
  credit?: HostCredit;
}

export interface Photo {
  src: string;
  /** Describe what is happening in the photo, not the listing name. */
  alt: string;
}

/** How taxes sit next to the listed price. */
export type PriceTaxes = "extra" | "inclusive";

export interface Price {
  /** Lowest per-person price in rupees. Ignored when askForPrice is true. */
  fromAmount: number;
  /** Kept for API compat; not shown on guest UI. */
  paidTo: string;
  /**
   * Venue / walk-in listings with no published tariff.
   * BookingBar says "Ask for the price" and Call dials the host.
   */
  askForPrice?: boolean;
  /** "+ taxes" vs "inclusive of taxes". Defaults to inclusive. */
  taxes?: PriceTaxes;
}

export interface Place {
  /** e.g. "Siolim jetty, North Goa" */
  name: string;
  /** Area line for venues, e.g. "Assagao, North End". */
  neighborhood?: string;
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
