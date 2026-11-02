"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { isVenueListing } from "@/features/experience/utils/listingKind";
import { googleMapsDirections, rupees } from "@/features/experience/utils/schedule";
import { useScrollChrome } from "@/features/experience/utils/useScrollChrome";
import { priceLabel, type FeedItem } from "@/features/home/utils/feedData";
import { ActionRow } from "@/shared/components/ActionRow";
import { AppBar } from "@/shared/components/AppBar";
import { Banner } from "@/shared/components/Banner";
import { BookingBar } from "@/shared/components/BookingBar";
import { Button } from "@/shared/components/Button";
import { ContactSheet } from "@/shared/components/ContactSheet";
import { Disclaimer } from "@/shared/components/Disclaimer";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { HeroGallery, HeroPlaceholder } from "@/shared/components/HeroGallery";
import { CREDIT_LABEL, HostRow } from "@/shared/components/HostRow";
import { AlertIcon, WifiOffIcon } from "@/shared/components/icons";
import { InfoList } from "@/shared/components/InfoList";
import { MenuPages } from "@/shared/components/MenuPages";
import { MenuViewer } from "@/shared/components/MenuViewer";
import { ReviewList } from "@/shared/components/ReviewList";
import { Section } from "@/shared/components/Section";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import { TabBar } from "@/shared/components/TabBar";
import { TitleBlock } from "@/shared/components/TitleBlock";
import { useToast } from "@/shared/components/Toast";
import { Verdict } from "@/shared/components/Verdict";
import { useSaved } from "@/shared/utils/useSaved";
import type { Experience, ScreenState } from "@/types/experience";
import listing from "../styles/listingSections.module.css";
import { AboutBlock } from "./AboutBlock";
import { Checklist } from "./Checklist";
import { DetailFacts, type DetailFact } from "./DetailFacts";
import { FaqList } from "./FaqList";
import { HealthAdvisory } from "./HealthAdvisory";
import { IncludedBoxes } from "./IncludedBoxes";
import { ProcessSteps } from "./ProcessSteps";
import { TipsBox } from "./TipsBox";
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
  const [contactOpen, setContactOpen] = useState(false);
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
  const sheetOpen = contactOpen || menuAt !== null || auth.authOpen;
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
    <>
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

      <div className={styles.app}>
        <main>
          {error ? (
            <div>
              <HeroPlaceholder ref={heroRef} />
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
            </div>
          ) : loading ? (
            <ExperienceDetailSkeleton summaryClassName={styles.summary} />
          ) : (
            <Populated
              experience={experience!}
              offline={state === "offline"}
              heroRef={heroRef}
              onShare={share}
              onOpenMenu={setMenuAt}
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
        </main>
      </div>

      <TabBar
        shown={chrome.tabShown}
        current="explore"
        onContact={() => setContactOpen(true)}
        savedDot={savedStore.hasAny}
        onFocusWithin={chrome.reveal}
        onProfile={(e) => {
          if (auth.user) return;
          e.preventDefault();
          auth.requireAuth("profile", () => router.push("/profile"));
        }}
      />

      {experience && (
        <BookingBar
          priceFrom={experience.price.fromAmount}
          askForPrice={
            experience.price.askForPrice || isVenueListing(experience)
          }
          walkIn={
            isVenueListing(experience) && experience.content?.walkIn === true
          }
          bookHref={
            isVenueListing(experience)
              ? undefined
              : experience.content?.links?.book?.url || undefined
          }
          taxes={experience.price.taxes ?? "inclusive"}
          phone={experience.host.phone}
          hostBusinessName={experience.host.businessName}
          lifted={chrome.tabShown}
          hidden={error}
          onCallToBook={onCallToBook}
        />
      )}

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />

      {experience?.menu && experience.menu.pages.length > 0 && (
        <MenuViewer
          open={menuAt !== null}
          startIndex={menuAt ?? 0}
          pages={experience.menu.pages}
          venueName={experience.host.businessName}
          onClose={() => setMenuAt(null)}
        />
      )}
    </>
  );
}

function Populated({
  experience: x,
  offline,
  heroRef,
  onShare,
  onOpenMenu,
  related,
  savedSlugs,
  onToggleRelatedSave,
}: {
  experience: Experience;
  offline: boolean;
  heroRef: React.RefObject<HTMLDivElement | null>;
  onShare: () => void;
  onOpenMenu: (index: number) => void;
  related: FeedItem[];
  savedSlugs: string[];
  onToggleRelatedSave: (slug: string) => void;
}) {
  const content = x.content ?? {};
  const faqs = (content.faqs ?? []).filter((f) => f.q.trim() || f.a.trim());
  const mapsHref =
    content.links?.maps?.url ||
    googleMapsDirections(x.place.lat, x.place.lng);
  const menuLink = content.links?.menu;
  const hasPhotos = x.photos.length > 0;
  const venue = isVenueListing(x);
  const area = x.place.neighborhood?.trim() || x.place.name;
  const venuePrice = venue ? venuePriceLine(x) : "";
  const details = detailFacts(x);
  const carry = carryList(content);
  const tips = knowBeforeYouGo(x);
  const instagramHandle =
    x.host.instagramHandle?.trim() ||
    instagramHandleFromUrl(content.links?.instagram?.url);

  return (
    <div>
      {hasPhotos ? (
        <HeroGallery ref={heroRef} photos={x.photos} />
      ) : (
        <HeroPlaceholder ref={heroRef} />
      )}

      <div className={styles.summary}>
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
          hostName={venue ? undefined : x.host.businessName}
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
      </div>

      <hr className={styles.rule} />

      <div className={styles.content}>
        <AboutBlock
          title={x.title}
          lead={venue ? x.about : content.pitch}
          text={venue ? undefined : x.about}
          photo={x.photos[1] ?? x.photos[0]}
        />
        {venue && venuePrice ? (
          <Section title="Prices">
            <p className={listing.price}>{venuePrice}</p>
          </Section>
        ) : null}
        {x.menu && x.menu.pages.length > 0 && (
          <Section title="Menu">
            <MenuPages pages={x.menu.pages} onOpen={(i) => onOpenMenu(i)} />
          </Section>
        )}
        {!venue && !x.menu?.pages?.length && menuLink?.url ? (
          <Section title="Menu">
            <a
              className="t-body"
              href={menuLink.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {menuLink.label || "Open menu"}
            </a>
          </Section>
        ) : null}
        {!venue && details.length > 0 ? (
          <Section title="Details">
            <DetailFacts facts={details} />
          </Section>
        ) : null}
        {x.included.length > 0 ? <IncludedBoxes items={x.included} /> : null}
        {!venue ? (
          <Section title="The process">
            <ProcessSteps hostName={x.host.businessName} area={area} />
          </Section>
        ) : null}
        {content.healthAdvisory?.trim() ? (
          <HealthAdvisory text={content.healthAdvisory.trim()} />
        ) : null}
        {carry.length > 0 ? (
          <Section title="Things to get with you">
            <Checklist items={carry} />
          </Section>
        ) : null}
        {!venue && tips.length > 0 ? (
          <Section title="Know before you go">
            <TipsBox tips={tips} />
          </Section>
        ) : null}
        {!venue && faqs.length > 0 ? (
          <Section title="FAQs">
            <FaqList faqs={faqs} />
          </Section>
        ) : null}
        {!venue ? (
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
        <Disclaimer
          hostName={x.host.businessName}
          credit={x.host.credit ?? "hosted"}
        />

        {related.length > 0 && (
          <Section title="More in Goa">
            <div className={styles.related}>
              {related.map((item) => (
                <ExperienceCard
                  key={item.slug}
                  density="portrait"
                  href={`/experiences/${item.slug}`}
                  title={item.title}
                  placeLabel={item.placeLabel}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  priceLabel={priceLabel(item)}
                  saved={savedSlugs.includes(item.slug)}
                  onToggleSave={() => onToggleRelatedSave(item.slug)}
                />
              ))}
            </div>
          </Section>
        )}
        <SiteFooter source={x.slug} />
      </div>
    </div>
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

/** Places: the sheet's own price line, e.g. "₹3,000 for two (approx)". */
function venuePriceLine(x: Experience): string {
  const narrative = x.content?.priceNarrative?.trim();
  if (narrative) return narrative;
  if (x.price.askForPrice || !x.price.fromAmount) return "";
  const unit = x.content?.priceUnit?.trim();
  return unit ? `${rupees(x.price.fromAmount)}, ${unit}` : `${rupees(x.price.fromAmount)} per person`;
}

function detailFacts(x: Experience): DetailFact[] {
  const c = x.content ?? {};
  const facts: DetailFact[] = [];
  const age = x.hours?.ageGroup?.trim();
  const fitness = (c.fitnessLevel || c.difficulty || x.hours?.difficulty || "").trim();
  const ratio = c.instructorRatio?.trim();
  if (age) facts.push({ label: "Age", value: age });
  if (fitness) facts.push({ label: "Fitness level", value: fitness });
  if (ratio) facts.push({ label: "Student to instructor ratio", value: ratio });
  return facts;
}

function carryList(c: NonNullable<Experience["content"]>): string[] {
  if (c.carry?.length) return c.carry.map((s) => s.trim()).filter(Boolean);
  return (c.whatToCarry ?? "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Tips from admin, else the booking and cancellation notes plus the final-terms line. */
function knowBeforeYouGo(x: Experience): string[] {
  const c = x.content ?? {};
  const tips = c.knowBeforeYouGo?.length
    ? [...c.knowBeforeYouGo]
    : [...(x.policy?.booking ?? []), ...(x.policy?.cancellation ?? [])];
  const info = c.additionalInfo?.trim();
  // Sheets often repeat the tips as one paragraph in additional info.
  if (info && !tips.some((tip) => info.includes(tip.trim()))) tips.push(info);
  if (x.policy && x.policy.showFinalTermsNote !== false) {
    tips.push(`Check the final terms with ${x.host.businessName} before you pay.`);
  }
  return [...new Set(tips.map((s) => s.trim()).filter(Boolean))];
}
