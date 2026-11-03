import type {
  Experience,
  ExperienceContent,
  IncludedItem,
  ListingHours,
  WeekSchedule,
  Weekday,
} from "@/types/experience";
import { apiBaseUrl, hasApiBaseUrl } from "@/shared/utils/apiBase";
import type { FeedItem } from "@/features/home/utils/feedData";
import { formatDuration } from "@/shared/utils/formatDuration";

const FALLBACK_IMAGE = "/demo/jetty-dusk.png";

type ApiListingCard = {
  slug: string;
  title: string;
  placeLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  blurb?: string;
  durationMinutes?: number;
  priceInr?: number;
  priceAsk?: boolean;
  format?: "trip" | "venue";
};

type ApiExperience = {
  slug: string;
  title: string;
  host: Experience["host"];
  photos: Experience["photos"];
  verdict: string;
  price: Experience["price"];
  place: {
    name: string;
    neighborhood?: string;
    lat: number;
    lng: number;
    distance?: string;
  };
  schedule?: WeekSchedule | ListingHours | Record<string, unknown>;
  durationMinutes: number;
  groupSize: string;
  about: string;
  included?: IncludedItem[];
  menu?: Experience["menu"];
  policy?: Experience["policy"];
  reviews?: Experience["reviews"];
  tags?: string[];
  content?: ExperienceContent;
};

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isWeekSchedule(value: unknown): value is WeekSchedule {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as object);
  if (!keys.length) return true;
  return keys.every((k) => WEEKDAYS.includes(k as Weekday));
}

function asListingHours(value: unknown): ListingHours | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  if (isWeekSchedule(value)) {
    const keys = Object.keys(value);
    if (!keys.length) return undefined;
    return undefined;
  }
  const row = value as Record<string, unknown>;
  return {
    days: typeof row.days === "string" ? row.days : undefined,
    timeSlot: typeof row.timeSlot === "string" ? row.timeSlot : undefined,
    bestTime: typeof row.bestTime === "string" ? row.bestTime : undefined,
    ageGroup: typeof row.ageGroup === "string" ? row.ageGroup : undefined,
    minPeople: typeof row.minPeople === "string" ? row.minPeople : undefined,
    durationLabel:
      typeof row.durationLabel === "string" ? row.durationLabel : undefined,
    difficulty: typeof row.difficulty === "string" ? row.difficulty : undefined,
  };
}

function includedFromContent(content: ExperienceContent | undefined): IncludedItem[] {
  if (!content) return [];
  const yes = (content.included ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((title) => ({ included: true, title }));
  const no = (content.notIncluded ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((title) => ({ included: false, title }));
  return [...yes, ...no];
}

export function mapApiExperience(raw: ApiExperience): Experience {
  const content = raw.content ?? {};
  const hours = asListingHours(raw.schedule);
  const week = isWeekSchedule(raw.schedule) ? raw.schedule : {};
  const included =
    raw.included && raw.included.length > 0
      ? raw.included
      : includedFromContent(content);

  const taxes =
    content.taxes === "extra" || content.taxes === "inclusive"
      ? content.taxes
      : raw.price?.taxes === "extra" || raw.price?.taxes === "inclusive"
        ? raw.price.taxes
        : "inclusive";

  return {
    slug: raw.slug,
    title: raw.title,
    host: {
      ...raw.host,
      languages: raw.host.languages?.length
        ? raw.host.languages
        : content.languages ?? [],
    },
    photos: raw.photos ?? [],
    verdict: raw.verdict,
    price: {
      ...raw.price,
      taxes,
    },
    place: {
      name: raw.place.name,
      neighborhood:
        raw.place.neighborhood?.trim() ||
        content.locationLabel?.trim() ||
        undefined,
      lat: raw.place.lat,
      lng: raw.place.lng,
      distance: raw.place.distance || content.distance || undefined,
    },
    schedule: week ?? {},
    hours,
    duration: content.durationLabel?.trim() || formatDuration(raw.durationMinutes),
    groupSize: raw.groupSize,
    about: raw.about,
    included,
    menu: raw.menu,
    policy: raw.policy,
    reviews: raw.reviews,
    tags: raw.tags ?? content.tagsOnDisplay ?? [],
    content,
  };
}

function mapApiCard(card: ApiListingCard): FeedItem {
  return {
    slug: card.slug,
    title: card.title,
    placeLabel: card.placeLabel,
    imageSrc: card.imageSrc ?? FALLBACK_IMAGE,
    imageAlt: card.imageAlt ?? card.title,
    blurb: card.blurb,
    durationLabel: formatDuration(card.durationMinutes) || undefined,
    durationMinutes: card.durationMinutes,
    priceInr: card.priceAsk ? undefined : card.priceInr,
    format: card.format,
  };
}

async function getJson<T>(path: string): Promise<T | null> {
  if (!hasApiBaseUrl()) return null;
  const base = apiBaseUrl();
  try {
    const init: RequestInit =
      typeof window === "undefined"
        ? { next: { revalidate: 60 } }
        : { cache: "no-store" };
    const res = await fetch(`${base}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Every live listing as a card. Which ones show where is up to the screen. */
export async function fetchCatalogCards(): Promise<FeedItem[] | null> {
  const data = await getJson<{ cards: ApiListingCard[] }>("/v1/catalog/cards");
  if (!data?.cards?.length) return null;
  return data.cards.map(mapApiCard);
}

export async function fetchCatalogExperience(
  slug: string,
): Promise<Experience | null> {
  const data = await getJson<ApiExperience>(
    `/v1/catalog/experiences/${encodeURIComponent(slug)}`,
  );
  if (!data?.slug) return null;
  return mapApiExperience(data);
}
