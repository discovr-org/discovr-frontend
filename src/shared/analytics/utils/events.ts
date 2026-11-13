/** Where a listing card sits. `list` and `section_*` come from TrackList; the rest from the card. */
export type CardProps = {
  slug: string;
  title: string;
  list: CardList;
  position: number;
  format?: "trip" | "venue";
  price_inr?: number;
  place?: string;
  section_id?: string;
  section_title?: string;
  layout?: "rail" | "stack" | "grid";
  /** Set on search results: what they typed. */
  search_query?: string;
};

export type CardList = "home" | "search" | "saved" | "more_in_goa";

/** Sent with every listing-page event, so each one says which listing without a join. */
export type ListingProps = {
  slug: string;
  title: string;
  format: "trip" | "venue";
  area?: string;
  price_inr?: number;
  ask_for_price: boolean;
};

/** Where a tap happened. */
export type Location =
  | "card"
  | "app_bar"
  | "action_row"
  | "info_list"
  | "booking_bar"
  | "menu_section"
  | "story"
  | "listing_links"
  | "tab_bar"
  | "top_nav"
  | "contact_sheet"
  | "footer";

/** Every button event: which button, the words on it, and where it sits. */
type Cta = { cta: string; cta_label: string; location: Location };

type Empty = Record<string, never>;

/**
 * Every custom event and its fields. Names are object_action, snake_case.
 * The privacy page promises no name or phone in analytics: see NoPii below.
 */
export type EventMap = {
  // Discovery
  experience_card_viewed: CardProps;
  experience_card_clicked: CardProps;
  home_section_viewed: {
    section_id: string;
    section_title: string;
    cards_count: number;
    position: number;
    layout: "rail" | "stack";
  };
  /** Clicks on results are experience_card_clicked with list "search" and search_query. */
  search_performed: { query: string; query_length: number; results_count: number };

  // Listing page (all carry ListingProps)
  experience_viewed: ListingProps & {
    book_via: "call" | "link";
    has_menu: boolean;
    photos_count: number;
    source_list?: CardList;
    source_section?: string;
    source_section_title?: string;
    source_position?: number;
  };
  story_viewed: ListingProps & { blocks_count: number; photos_shown: boolean };
  story_completed: ListingProps & { blocks_count: number };
  /** position is 1-based among the FAQs. */
  faq_opened: ListingProps & { question: string; position: number; location: "story" };
  hero_photo_changed: ListingProps & { index: number; total: number };
  menu_opened: ListingProps & Cta & { pages: number; start_page: number };
  menu_page_viewed: ListingProps & { page: number; pages: number };
  hours_expanded: ListingProps & Cta;
  directions_clicked: ListingProps & Cta;
  call_clicked: ListingProps & Cta;
  share_clicked: ListingProps & Cta & { method: "native" | "copy" };
  report_opened: ListingProps & Cta;
  /** kind is one of the fixed "What's wrong?" options, never their text. */
  report_submitted: Pick<ListingProps, "slug" | "title"> & { kind: string };

  // Conversion
  book_clicked: ListingProps &
    Cta & {
      method: "call" | "link";
      host: string;
      gated_by_auth: boolean;
    };
  /** From a card: the card's list, section and position. From a listing: the listing. */
  experience_saved: SaveProps;
  experience_unsaved: SaveProps;

  // Sign-in (never the number)
  auth_sheet_opened: { intent: string };
  otp_requested: { intent: string };
  otp_verified: { intent: string; needs_name: boolean };
  otp_failed: { step: "send" | "verify"; reason: string };
  name_submitted: { intent: string };
  auth_sheet_closed: { intent: string; completed: boolean };
  signed_out: Empty;

  // Navigation and support
  tab_clicked: { tab: string; location: "tab_bar" | "top_nav" };
  contact_sheet_opened: { location: "tab_bar" | "top_nav" };
  contact_clicked: Cta & { channel: "whatsapp" | "call" };
  footer_link_clicked: Cta & { href: string };
  /** category is one of the fixed help options, never their message. */
  help_request_submitted: { category: string };

  // Page
  scroll_depth: { depth: 25 | 50 | 75 | 100; slug?: string };
  analytics_opted_out: Empty;
  /**
   * One device fix per visit (or when the spot moves).
   * Same fields are also registered on later events. `$geoip_*` stays the IP guess.
   */
  location_captured: {
    device_latitude: number;
    device_longitude: number;
    device_location_accuracy_m: number;
  };
  /** "Till when are you in Goa?" sheet came up. */
  trip_end_shown: { had_answer: boolean };
  trip_end_answered: {
    status: "date" | "later" | "local" | "not_yet";
    /** Only for a picked day: 0 = today. */
    days_from_today?: number;
    signed_in: boolean;
  };
  /** A printed QR opened the site. Same utm_* values PostHog stores for the visit. */
  qr_scanned: { utm_source: string; utm_medium: string; utm_campaign: string };
};

type SaveProps =
  | (CardProps & { location: "card" })
  | (ListingProps & { location: "app_bar" });

type PiiField = "phone" | "phone_e164" | "phoneE164" | "name" | "first_name" | "email";
type Expect<T extends true> = T;
/** Fails the type check if any event gains a name, phone or email field. */
export type NoPii = Expect<
  [{ [E in keyof EventMap]: Extract<keyof EventMap[E], PiiField> }[keyof EventMap]] extends [never]
    ? true
    : false
>;
