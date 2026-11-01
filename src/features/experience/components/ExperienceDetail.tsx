"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import {
  useAuthGate,
  type AuthIntent,
} from "@/features/auth/utils/useAuthGate";
import { googleMapsDirections } from "@/features/experience/utils/schedule";
import { useScrollChrome } from "@/features/experience/utils/useScrollChrome";
import {
  feedSections,
  priceLabel,
  type FeedItem,
} from "@/features/home/utils/feedData";
import { ActionRow } from "@/shared/components/ActionRow";
import { AppBar } from "@/shared/components/AppBar";
import { Banner } from "@/shared/components/Banner";
import { BookingBar } from "@/shared/components/BookingBar";
import { Button } from "@/shared/components/Button";
import { ContactSheet } from "@/shared/components/ContactSheet";
import { Disclaimer } from "@/shared/components/Disclaimer";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { FactList, includedFacts } from "@/shared/components/FactList";
import { HeroGallery, HeroPlaceholder } from "@/shared/components/HeroGallery";
import { HostRow } from "@/shared/components/HostRow";
import { AlertIcon, WifiOffIcon } from "@/shared/components/icons";
import { InfoList } from "@/shared/components/InfoList";
import { MenuPages } from "@/shared/components/MenuPages";
import { MenuViewer } from "@/shared/components/MenuViewer";
import { PolicyDisclosure } from "@/shared/components/PolicyDisclosure";
import { ReviewList } from "@/shared/components/ReviewList";
import { Section } from "@/shared/components/Section";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import { TabBar } from "@/shared/components/TabBar";
import { TitleBlock } from "@/shared/components/TitleBlock";
import { useToast } from "@/shared/components/Toast";
import { Verdict } from "@/shared/components/Verdict";
import {
  readSavedSlugs,
  toggleSavedSlug,
} from "@/shared/utils/savedStore";
import type { Experience, ScreenState } from "@/types/experience";
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
}: ExperienceDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuAt, setMenuAt] = useState<number | null>(null);
  const auth = useAuthGate();

  useEffect(() => {
    const next = readSavedSlugs();
    if (experience && initiallySaved && !next.includes(experience.slug)) {
      setSavedSlugs(toggleSavedSlug(experience.slug));
      return;
    }
    setSavedSlugs(next);
  }, [experience, initiallySaved]);

  const saved = experience ? savedSlugs.includes(experience.slug) : false;
  const related = useMemo(() => relatedFor(experience?.slug), [experience?.slug]);

  const loading = state === "loading" || !experience;
  const error = state === "error";
  const sheetOpen = contactOpen || menuAt !== null || auth.authOpen;
  const chrome = useScrollChrome(heroRef, barRef, {
    held: sheetOpen,
    forceShown: loading && !error,
  });

  const setSavedAndNotify = useCallback(
    (v: boolean, silent = false) => {
      if (experience) {
        const has = readSavedSlugs().includes(experience.slug);
        if (has !== v) setSavedSlugs(toggleSavedSlug(experience.slug));
        else setSavedSlugs(readSavedSlugs());
      }
      onSaveChange?.(v);
      if (silent) return;
      if (v) {
        toast("Saved. Send it to your group from Saved.", {
          onUndo: () => setSavedAndNotify(false, true),
        });
      } else {
        toast("Removed from saved");
      }
    },
    [experience, onSaveChange, toast],
  );

  const dialHost = useCallback(() => {
    if (!experience) return;
    toast(`Calling ${experience.host.businessName}`);
    window.location.href = `tel:${experience.host.phone}`;
  }, [experience, toast]);

  const runIntent = useCallback(
    (intent: AuthIntent) => {
      if (intent === "save") setSavedAndNotify(true);
      else dialHost();
    },
    [dialHost, setSavedAndNotify],
  );

  const onToggleSave = useCallback(() => {
    if (saved) {
      setSavedAndNotify(false);
      return;
    }
    auth.requireAuth("save", () => setSavedAndNotify(true));
  }, [auth, saved, setSavedAndNotify]);

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
              savedSlugs={savedSlugs}
              onToggleRelatedSave={(slug) => {
                const next = toggleSavedSlug(slug);
                setSavedSlugs(next);
                toast(
                  next.includes(slug)
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
        savedDot={saved}
        onFocusWithin={chrome.reveal}
      />

      {experience && (
        <BookingBar
          priceFrom={experience.price.fromAmount}
          askForPrice={experience.price.askForPrice}
          phone={experience.host.phone}
          hostBusinessName={experience.host.businessName}
          hostPersonName={experience.host.personName}
          lifted={chrome.tabShown}
          hidden={error}
          onCallToBook={onCallToBook}
        />
      )}

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />

      <AuthSheet
        open={auth.authOpen}
        onClose={auth.closeAuth}
        onSendCode={auth.onSendCode}
        onVerifyCode={auth.onVerifyCode}
        onSuccess={(phone) => auth.onSuccess(phone, runIntent)}
        termsHref="/terms"
        privacyHref="/privacy"
      />

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

function relatedFor(slug?: string): FeedItem[] {
  if (!slug) return [];
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  for (const section of feedSections) {
    for (const item of section.items) {
      if (item.slug === slug) continue;
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      out.push(item);
      if (out.length >= 4) return out;
    }
  }
  return out;
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
  return (
    <div>
      <HeroGallery ref={heroRef} photos={x.photos} />

      <div className={styles.summary}>
        {offline && (
          <Banner
            tone="notice"
            icon={<WifiOffIcon />}
            title="You're offline"
            text="Showing what we had. Times may be out of date."
          />
        )}
        <TitleBlock title={x.title} hostName={x.host.businessName} />
        <InfoList
          priceFrom={x.price.fromAmount}
          paidTo={x.price.paidTo}
          askForPrice={x.price.askForPrice}
          place={x.place}
          schedule={x.schedule}
          duration={x.duration}
          groupSize={x.groupSize}
        />
        <Verdict text={x.verdict} />
        <ActionRow
          hostName={x.host.businessName}
          phone={x.host.phone}
          directionsHref={googleMapsDirections(x.place.lat, x.place.lng)}
          instagramHandle={x.host.instagramHandle}
          onShare={onShare}
        />
      </div>

      <hr className={styles.rule} />

      <div className={styles.content}>
        <Section title="About">
          <p className="t-body">{x.about}</p>
        </Section>
        {x.menu && x.menu.pages.length > 0 && (
          <Section title="Menu">
            <MenuPages pages={x.menu.pages} onOpen={(i) => onOpenMenu(i)} />
          </Section>
        )}
        <Section title="What's included">
          <FactList items={includedFacts(x.included)} />
        </Section>
        <Section title="Your host" id="host">
          <HostRow host={x.host} />
        </Section>
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
        {x.policy && <PolicyDisclosure key={x.slug} policy={x.policy} />}
        <Disclaimer hostName={x.host.businessName} />

        {related.length > 0 && (
          <Section title="Also worth a look">
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
      </div>
    </div>
  );
}
