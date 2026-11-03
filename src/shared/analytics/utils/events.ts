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

type Slug = { slug: string };
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

  // Listing page
  experience_viewed: Slug & {
    title: string;
    format: "trip" | "venue";
    area?: string;
    price_inr?: number;
    ask_for_price: boolean;
    book_via: "call" | "link";
    has_menu: boolean;
    photos_count: number;
    source_list?: CardList;
    source_section?: string;
    source_position?: number;
  };
  story_viewed: Slug & { blocks_count: number; photos_shown: boolean };
  story_completed: Slug & { blocks_count: number };
  faq_opened: Slug & { question: string };
  hero_photo_changed: Slug & { index: number; total: number };
  menu_opened: Slug & { pages: number };
  menu_page_viewed: Slug & { page: number; pages: number };
  hours_expanded: Slug;
  directions_clicked: Slug;
  call_clicked: Slug;
  share_clicked: Slug & { method: "native" | "copy" };
  report_opened: Slug;
  /** kind is one of the fixed "What's wrong?" options, never their text. */
  report_submitted: Slug & { kind: string };

  // Conversion
  book_clicked: Slug & {
    method: "call" | "link";
    host: string;
    price_inr?: number;
    ask_for_price: boolean;
    gated_by_auth: boolean;
  };
  experience_saved: Slug & { from: string };
  experience_unsaved: Slug & { from: string };

  // Sign-in (never the number)
  auth_sheet_opened: { intent: string };
  otp_requested: { intent: string };
  otp_verified: { intent: string; needs_name: boolean };
  otp_failed: { step: "send" | "verify"; reason: string };
  name_submitted: { intent: string };
  auth_sheet_closed: { intent: string; completed: boolean };
  signed_out: Empty;

  // Navigation and support
  tab_clicked: { tab: string };
  contact_sheet_opened: Empty;
  contact_clicked: { channel: "whatsapp" | "call"; from: string };
  footer_link_clicked: { label: string };
  /** category is one of the fixed help options, never their message. */
  help_request_submitted: { category: string };

  // Page
  scroll_depth: { depth: 25 | 50 | 75 | 100; slug?: string };
  analytics_opted_out: Empty;
};

type PiiField = "phone" | "phone_e164" | "phoneE164" | "name" | "first_name" | "email";
type Expect<T extends true> = T;
/** Fails the type check if any event gains a name, phone or email field. */
export type NoPii = Expect<
  [{ [E in keyof EventMap]: Extract<keyof EventMap[E], PiiField> }[keyof EventMap]] extends [never]
    ? true
    : false
>;
