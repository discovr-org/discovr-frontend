"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { isVenueListing } from "@/features/experience/utils/listingKind";
import { googleMapsDirections } from "@/features/experience/utils/schedule";
import { useScrollChrome } from "@/features/experience/utils/useScrollChrome";
import { priceLabel, type FeedItem } from "@/features/home/utils/feedData";
import { ActionRow } from "@/shared/components/ActionRow";
import { AppBar } from "@/shared/components/AppBar";
import { AppShell } from "@/shared/components/AppShell";
import { Banner } from "@/shared/components/Banner";
import { BookingBar } from "@/shared/components/BookingBar";
import { Button } from "@/shared/components/Button";
import { Disclaimer } from "@/shared/components/Disclaimer";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { HeroGallery, HeroPlaceholder } from "@/shared/components/HeroGallery";
import { CREDIT_LABEL, HostRow } from "@/shared/components/HostRow";
import { AlertIcon, WifiOffIcon } from "@/shared/components/icons";
import { InfoList } from "@/shared/components/InfoList";
import { MenuPages } from "@/shared/components/MenuPages";
import { MenuViewer } from "@/shared/components/MenuViewer";
import { PolicyDisclosure } from "@/shared/components/PolicyDisclosure";
import { ReviewList } from "@/shared/components/ReviewList";
import { Section } from "@/shared/components/Section";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import { TitleBlock } from "@/shared/components/TitleBlock";
import { useToast } from "@/shared/components/Toast";
import { Verdict } from "@/shared/components/Verdict";
import { useSaved } from "@/shared/utils/useSaved";
import { TrackList } from "@/shared/analytics/components/TrackList";
import { cardTrack, takeCardSource } from "@/shared/analytics/utils/cardSource";
import type { ListingProps } from "@/shared/analytics/utils/events";
import { track } from "@/shared/analytics/utils/track";
import { useScrollDepth } from "@/shared/analytics/utils/useScrollDepth";
import { useTrackView } from "@/shared/analytics/utils/useTrackView";
import type { Experience, ScreenState } from "@/types/experience";
import { storyBlocks } from "../utils/story";
import { ReportSheet } from "./ReportSheet";
import { StoryBlocks } from "./StoryBlocks";
import styles from "./ExperienceDetail.module.css";

export interface ExperienceDetailProps {
  /**
   * The listing. While loading you can pass what you already know from the card
   * (it fills the BookingBar), or nothing.
   */
  experience?: Experience;
  state?: ScreenState;
  onRetry?: () => void;
  /** Persist saves however your app does; the screen only keeps local state. */
  initiallySaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
  /** Related cards from the catalog feed (API). */
  relatedItems?: FeedItem[];
}

/**
 * The experience detail screen in all its states: populated, loading, offline, error.
 * Must be rendered inside <ToastProvider>.
 */
export function ExperienceDetail({
  experience,
  state = "populated",
  onRetry,
  initiallySaved = false,
  onSaveChange,
  relatedItems = [],
}: ExperienceDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuAt, setMenuAt] = useState<number | null>(null);
  const auth = useAuth();
  const savedStore = useSaved();

  const saved = experience ? savedStore.isSaved(experience.slug) : initiallySaved;
  const related = useMemo(() => {
    if (!experience?.slug) return [];
    return relatedItems.filter((item) => item.slug !== experience.slug).slice(0, 4);
  }, [experience?.slug, relatedItems]);

  const loading = state === "loading" || !experience;
  const error = state === "error";
  const sheetOpen = reportOpen || menuAt !== null || auth.authOpen;
  const chrome = useScrollChrome(heroRef, barRef, {
    held: sheetOpen,
    forceShown: loading && !error,
  });

  // Once per visit, after the full listing (not the card preview) has loaded. Coming back to a
  // listing Next kept alive counts as a new visit, as the effect runs again when it's shown.
  const shown = !loading && !error;
  const shownSlug = shown ? experience?.slug : undefined;
  const sendViewed = useEffectEvent(() => {
    if (!experience) return;
    const source = takeCardSource(experience.slug);
    track("experience_viewed", {
      ...listingProps(experience),
      book_via: experience.content?.bookVia === "link" ? "link" : "call",
      has_menu: Boolean(experience.menu?.pages.length),
      photos_count: experience.photos.length,
      source_list: source?.list,
      source_section: source?.section,
      source_section_title: source?.sectionTitle,
      source_position: source?.position,
    });
  });
  useEffect(() => {
    if (shownSlug) sendViewed();
  }, [shownSlug]);

  const setSavedAndNotify = useCallback(
    (v: boolean, silent = false) => {
      if (!experience) return;
      const has = savedStore.isSaved(experience.slug);
      if (has !== v) savedStore.toggle(experience.slug);
      onSaveChange?.(v);
      if (silent) return;
      // Guests only get the signup sheet — no "Saved" toast on top.
      if (v && !auth.user) return;
      if (v) {
        toast("Saved. Send it to your group from Saved.", {
          onUndo: () => setSavedAndNotify(false, true),
        });
      } else {
        toast("Removed from saved");
      }
    },
    [auth.user, experience, onSaveChange, savedStore, toast],
  );

  const dialHost = useCallback(() => {
    if (!experience) return;
    toast(`Calling ${experience.host.businessName}`);
    window.location.href = `tel:${experience.host.phone}`;
  }, [experience, toast]);

  const onToggleSave = useCallback(() => {
    if (!experience) return;
    track(saved ? "experience_unsaved" : "experience_saved", {
      ...listingProps(experience),
      location: "app_bar",
    });
    if (saved) {
      setSavedAndNotify(false);
      return;
    }
    // Guest: keep in localStorage now; ask for number so we can sync later.
    setSavedAndNotify(true);
    if (!auth.user) auth.openAuth("save");
  }, [auth, experience, saved, setSavedAndNotify]);

  const onCallToBook = useCallback(() => {
    auth.requireAuth("call", dialHost);
  }, [auth, dialHost]);

  const share = useCallback(async (location: "app_bar" | "action_row") => {
    const url = window.location.href.split("#")[0];
    const title = experience?.title ?? "discovr";
    if (experience) {
      track("share_clicked", {
        ...listingProps(experience),
        cta: "share",
        cta_label: "Share",
        location,
        method: typeof navigator.share === "function" ? "native" : "copy",
      });
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore: the toast still tells them what to do */
    }
    toast("Link copied. Paste it in your group.");
  }, [experience, toast]);

  const back = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  return (
    <AppShell
      current="explore"
      savedDot={savedStore.hasAny}
      footer={!loading && !error}
      footerSource={experience?.slug}
    >
      <div className={styles.page} data-page="listing">
        <div className={styles.heroWrap}>
          <AppBar
            ref={barRef}
            title={loading ? "" : experience!.title}
            solid={chrome.solid}
            hidden={chrome.barHidden}
            saved={saved}
            onBack={back}
            onShare={() => void share("app_bar")}
            onToggleSave={onToggleSave}
            onFocusWithin={chrome.reveal}
          />
          {error ? (
            <HeroPlaceholder ref={heroRef} />
          ) : loading ? null : experience!.photos.length > 0 ? (
            <HeroGallery
              ref={heroRef}
              photos={experience!.photos}
              onIndexChange={(index, total) =>
                track("hero_photo_changed", { ...listingProps(experience!), index, total })
              }
            />
          ) : (
            <HeroPlaceholder ref={heroRef} />
          )}
        </div>

        {error ? (
          <EmptyState
            role="alert"
            icon={<AlertIcon />}
            title="That didn't load"
            text="Our fault, not your network. Try again in a moment."
            action={
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            }
          />
        ) : loading ? (
          <ExperienceDetailSkeleton summaryClassName={styles.head} />
        ) : (
          <Populated
            experience={experience!}
            offline={state === "offline"}
            onShare={() => void share("action_row")}
            onOpenMenu={(index) => {
              track("menu_opened", {
                ...listingProps(experience!),
                cta: "menu_page",
                cta_label: "Menu",
                location: "menu_section",
                pages: experience!.menu?.pages.length ?? 0,
                start_page: index + 1,
              });
              setMenuAt(index);
            }}
            onReport={() => {
              track("report_opened", {
                ...listingProps(experience!),
                cta: "report",
                cta_label: "Report wrong information",
                location: "listing_links",
              });
              setReportOpen(true);
            }}
            onCallToBook={onCallToBook}
            onBookClick={(method) => {
              const x = experience!;
              track("book_clicked", {
                ...listingProps(x),
                cta: method === "link" ? "book_on_site" : "call_to_book",
                cta_label: method === "link" ? `Book on ${x.host.businessName}` : "Call to book",
                location: "booking_bar",
                method,
                host: x.host.businessName,
                gated_by_auth: method === "call" && !auth.user,
              });
            }}
            related={related}
            savedSlugs={savedStore.slugs}
            onToggleRelatedSave={(slug) => {
              const nowSaved = savedStore.toggle(slug);
              if (nowSaved && !auth.user) {
                auth.openAuth("save");
                return;
              }
              toast(
                nowSaved
                  ? "Saved. Send it to your group from Saved."
                  : "Removed from saved",
              );
            }}
          />
        )}
      </div>

      {experience ? (
        <ReportSheet
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          listingTitle={experience.title}
          slug={experience.slug}
        />
      ) : null}

      {experience?.menu && experience.menu.pages.length > 0 && (
        <MenuViewer
          open={menuAt !== null}
          startIndex={menuAt ?? 0}
          pages={experience.menu.pages}
          venueName={experience.host.businessName}
          onClose={() => setMenuAt(null)}
          onPageChange={(index) =>
            track("menu_page_viewed", {
              ...listingProps(experience),
              page: index + 1,
              pages: experience.menu?.pages.length ?? 0,
            })
          }
        />
      )}
    </AppShell>
  );
}

function Populated({
  experience: x,
  offline,
  onShare,
  onOpenMenu,
  onReport,
  onCallToBook,
  onBookClick,
  related,
  savedSlugs,
  onToggleRelatedSave,
}: {
  experience: Experience;
  offline: boolean;
  onShare: () => void;
  onOpenMenu: (index: number) => void;
  onReport: () => void;
  onCallToBook: () => void;
  onBookClick: (method: "call" | "link") => void;
  related: FeedItem[];
  savedSlugs: string[];
  onToggleRelatedSave: (slug: string) => void;
}) {
  const content = x.content ?? {};
  const mapsHref =
    content.links?.maps?.url ||
    googleMapsDirections(x.place.lat, x.place.lng);
  const venue = isVenueListing(x);
  // A place credits its host only when someone else owns it ("Owned by Shilpa Shetty").
  const showHost = !venue || x.host.credit === "owned";
  const instagramHandle =
    x.host.instagramHandle?.trim() ||
    instagramHandleFromUrl(content.links?.instagram?.url);
  const policy = x.policy;
  const hasPolicy = Boolean(policy && (policy.booking.length || policy.cancellation.length));
  const blocks = storyBlocks(x);

  useScrollDepth(x.slug);
  const storyRef = useTrackView<HTMLDivElement>(
    () =>
      track("story_viewed", {
        ...listingProps(x),
        blocks_count: blocks.length,
        photos_shown: blocks.some((b) => b.type === "photo"),
      }),
    x.slug,
  );
  const storyEndRef = useTrackView<HTMLDivElement>(
    () => track("story_completed", { ...listingProps(x), blocks_count: blocks.length }),
    x.slug,
  );
  const onContact =
    (location: "info_list" | "action_row") => (action: "call" | "directions" | "hours") => {
      const cta = CONTACT_CTAS[action];
      track(cta.event, { ...listingProps(x), cta: action, cta_label: cta.label, location });
    };

  return (
    <>
      <div className={styles.columns}>
        <div className={styles.main}>
          <header className={styles.head}>
            {offline && (
              <Banner
                tone="notice"
                icon={<WifiOffIcon />}
                title="You're offline"
                text="Showing what we had. Times may be out of date."
              />
            )}
            <TitleBlock
              title={x.title}
              hostName={showHost ? x.host.businessName : undefined}
            />
            <InfoList
              priceFrom={x.price.fromAmount}
              askForPrice={x.price.askForPrice}
              taxes={x.price.taxes ?? "inclusive"}
              place={x.place}
              schedule={x.schedule}
              hours={x.hours}
              duration={x.duration}
              groupSize={x.groupSize}
              venue={venue}
              mapsHref={content.links?.maps?.url}
              onAction={onContact("info_list")}
            />
            <Verdict text={x.verdict} label={null} />
            <ActionRow
              hostName={x.host.businessName}
              phone={x.host.phone}
              directionsHref={mapsHref}
              instagramHandle={instagramHandle}
              onShare={onShare}
              onAction={onContact("action_row")}
            />
          </header>

          <Section title="About">
            {/* Start and end markers: a long story is never half on screen at once. */}
            <div ref={storyRef} aria-hidden="true" />
            <StoryBlocks
              blocks={blocks}
              onFaqOpen={(question, position) =>
                track("faq_opened", { ...listingProps(x), question, position, location: "story" })
              }
            />
            <div ref={storyEndRef} aria-hidden="true" />
          </Section>

          {x.menu && x.menu.pages.length > 0 ? (
            <Section title="Menu" id="menu">
              <MenuPages pages={x.menu.pages} onOpen={(i) => onOpenMenu(i)} />
            </Section>
          ) : null}

          {!venue && hasPolicy ? (
            <div className={styles.policy}>
              <PolicyDisclosure key={x.slug} policy={policy!} hostName={x.host.businessName} />
            </div>
          ) : null}

          {showHost ? (
            <Section title={`${CREDIT_LABEL[x.host.credit ?? "hosted"]} ${x.host.businessName}`} id="host">
              <HostRow host={x.host} showCredit={false} />
            </Section>
          ) : null}

          {x.reviews && x.reviews.count > 0 && (
            <ReviewList
              reviews={x.reviews.items}
              average={x.reviews.average}
              totalCount={x.reviews.count}
              distribution={x.reviews.distribution}
              onSeeAll={() => {
                /* All-reviews screen lands with bookings. */
              }}
            />
          )}

          <Disclaimer hostName={x.host.businessName} credit={x.host.credit ?? "hosted"} />

          <div className={styles.links}>
            <button type="button" className={styles.textLink} onClick={onReport}>
              Report wrong information
            </button>
            <a href={`/help?experience=${encodeURIComponent(x.slug)}`} className={styles.textLink}>
              Any problems with the experience? Contact us
            </a>
          </div>
        </div>

        <aside className={styles.side}>
          <BookingBar
            priceFrom={x.price.fromAmount}
            askForPrice={x.price.askForPrice || venue}
            walkIn={venue && content.walkIn === true}
            bookHref={content.bookVia === "link" ? content.links?.book?.url || undefined : undefined}
            taxes={x.price.taxes ?? "inclusive"}
            phone={x.host.phone}
            hostBusinessName={x.host.businessName}
            onCallToBook={onCallToBook}
            onBookClick={onBookClick}
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className={styles.block} aria-labelledby="more-related">
          <h2 id="more-related" className="t-title">
            More in Goa
          </h2>
          <TrackList list="more_in_goa" layout="grid">
            <ul className={styles.related}>
              {related.map((item, i) => (
                <li key={item.slug}>
                  <ExperienceCard
                    track={cardTrack(item, i)}
                    density="tile"
                    href={`/experiences/${item.slug}`}
                    title={item.title}
                    placeLabel={item.placeLabel}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    priceLabel={item.format === "venue" ? undefined : priceLabel(item)}
                    saved={savedSlugs.includes(item.slug)}
                    onToggleSave={() => onToggleRelatedSave(item.slug)}
                  />
                </li>
              ))}
            </ul>
          </TrackList>
        </section>
      )}
    </>
  );
}

const CONTACT_CTAS = {
  call: { event: "call_clicked", label: "Call" },
  directions: { event: "directions_clicked", label: "Directions" },
  hours: { event: "hours_expanded", label: "Hours" },
} as const;

/** Listing fields for every listing-page event. Price matches the BookingBar (places always ask). */
function listingProps(x: Experience): ListingProps {
  const venue = isVenueListing(x);
  const ask = Boolean(x.price.askForPrice) || venue;
  return {
    slug: x.slug,
    title: x.title,
    format: venue ? "venue" : "trip",
    area: x.place.neighborhood?.trim() || x.place.name,
    ask_for_price: ask,
    ...(ask ? {} : { price_inr: x.price.fromAmount }),
  };
}

/** Pull @handle from an Instagram profile URL when the host row has none. */
function instagramHandleFromUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    const handle = path.split("/")[0]?.replace(/^@/, "");
    if (!handle || handle === "p" || handle === "reel" || handle === "stories") {
      return undefined;
    }
    return handle;
  } catch {
    return undefined;
  }
}
