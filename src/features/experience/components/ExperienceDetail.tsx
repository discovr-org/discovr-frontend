"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import { SiteFooter } from "@/shared/components/SiteFooter";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import { TitleBlock } from "@/shared/components/TitleBlock";
import { useToast } from "@/shared/components/Toast";
import { Verdict } from "@/shared/components/Verdict";
import { useSaved } from "@/shared/utils/useSaved";
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

  const share = useCallback(async () => {
    const url = window.location.href.split("#")[0];
    const title = experience?.title ?? "discovr";
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
  }, [experience?.title, toast]);

  const back = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  return (
    <AppShell current="explore" savedDot={savedStore.hasAny}>
      <div className={styles.page} data-page="listing">
        <div className={styles.heroWrap}>
          <AppBar
            ref={barRef}
            title={loading ? "" : experience!.title}
            solid={chrome.solid}
            hidden={chrome.barHidden}
            saved={saved}
            onBack={back}
            onShare={share}
            onToggleSave={onToggleSave}
            onFocusWithin={chrome.reveal}
          />
          {error ? (
            <HeroPlaceholder ref={heroRef} />
          ) : loading ? null : experience!.photos.length > 0 ? (
            <HeroGallery ref={heroRef} photos={experience!.photos} />
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
            onShare={share}
            onOpenMenu={setMenuAt}
            onReport={() => setReportOpen(true)}
            onCallToBook={onCallToBook}
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
      {!loading && !error ? <SiteFooter source={experience!.slug} /> : null}

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
            />
            <Verdict text={x.verdict} label={null} />
            <ActionRow
              hostName={x.host.businessName}
              phone={x.host.phone}
              directionsHref={mapsHref}
              instagramHandle={instagramHandle}
              onShare={onShare}
            />
          </header>

          <Section title="About">
            <StoryBlocks blocks={storyBlocks(x)} />
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
            bookHref={venue ? undefined : content.links?.book?.url || undefined}
            taxes={x.price.taxes ?? "inclusive"}
            phone={x.host.phone}
            hostBusinessName={x.host.businessName}
            onCallToBook={onCallToBook}
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className={styles.block} aria-labelledby="more-related">
          <h2 id="more-related" className="t-title">
            More in Goa
          </h2>
          <ul className={styles.related}>
            {related.map((item) => (
              <li key={item.slug}>
                <ExperienceCard
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
        </section>
      )}
    </>
  );
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
