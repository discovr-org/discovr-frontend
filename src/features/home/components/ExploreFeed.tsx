"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
// Filter chips (hidden for now) also need: FEED_FILTERS, FeedFilter, Chip, chipStyles, SlidersIcon.
import { priceLabel, type FeedItem } from "@/features/home/utils/feedData";
import {
  NO_FILTERS,
  activeLabels,
  applyFilters,
  areaOf,
  areasIn,
  hasFilters,
  withoutLabel,
  type FeedFilters,
} from "@/features/home/utils/feedFilters";
import { FilterSheet } from "@/features/home/components/FilterSheet";
import { searchCards } from "@/features/home/utils/searchCards";
import { buildHomeSections } from "@/features/home/utils/homeSections";
import styles from "@/features/home/styles/exploreFeed.module.css";
import { AppShell } from "@/shared/components/AppShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { AlertIcon, CrossIcon, SearchIcon } from "@/shared/components/icons";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useToast } from "@/shared/components/Toast";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { useCatalogCards } from "@/shared/utils/useCatalogCards";
import { FeedSkeleton } from "@/features/home/components/FeedSkeleton";
import { HomeSection } from "@/features/home/components/HomeSection";
import { useSaved } from "@/shared/utils/useSaved";
import { TrackList } from "@/shared/analytics/components/TrackList";
import { cardTrack } from "@/shared/analytics/utils/cardSource";
import { track } from "@/shared/analytics/utils/track";
import { useScrollDepth } from "@/shared/analytics/utils/useScrollDepth";

const SEARCH_SETTLE_MS = 600;

/** `initialCards` come from the server so the first HTML already has every listing link. */
export function ExploreFeed({ initialCards }: { initialCards?: FeedItem[] }) {
  const [filters, setFilters] = useState<FeedFilters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stuck, setStuck] = useState(false);
  const stickSentinel = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLParagraphElement>(null);
  const cards = useCatalogCards();
  // The saved-cache wrapper hides query data while it restores, which blanked the server HTML.
  // Fall back to the server's cards so crawlers (and first paint) get real listings.
  const cardData = cards.data ?? initialCards;
  const sections = useMemo(() => buildHomeSections(cardData ?? []), [cardData]);
  // Cached data wins: only show loading/error when there is nothing to paint.
  const loadState = cardData ? "ready" : cards.isError || !hasApiBaseUrl() ? "error" : "loading";
  const saved = useSaved();
  const auth = useAuth();
  const toast = useToast();

  const onToggleSave = (slug: string) => {
    const was = saved.isSaved(slug);
    saved.toggle(slug);
    if (!was && !auth.user) {
      auth.openAuth("save");
      return;
    }
    toast(
      was
        ? "Removed from saved"
        : "Saved. Send it to your group from Saved.",
    );
  };

  // Header shrinks to the small wordmark + chips once the search bar scrolls away.
  useEffect(() => {
    const el = stickSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setStuck(!entry.isIntersecting);
      document.body.dataset.hero = entry.isIntersecting ? "visible" : "hidden";
    });
    io.observe(el);
    return () => {
      io.disconnect();
      delete document.body.dataset.hero;
    };
  }, []);

  const allCards = useMemo(() => cardData ?? [], [cardData]);
  const areas = useMemo(() => areasIn(allCards), [allCards]);
  const filtering = hasFilters(filters);
  const filtered = useMemo(() => applyFilters(allCards, filters), [allCards, filters]);

  const needle = query.trim().toLowerCase();
  const searching = needle.length > 0;

  const searchResults = useMemo(
    () => (searching ? searchCards(allCards, needle) : []),
    [needle, searching, allCards],
  );

  useScrollDepth();

  // One event per pause in typing, not per keystroke.
  const resultsCount = searchResults.length;
  useEffect(() => {
    if (!searching || loadState !== "ready") return;
    const timer = window.setTimeout(() => {
      track("search_performed", {
        query: needle,
        query_length: needle.length,
        results_count: resultsCount,
      });
    }, SEARCH_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [needle, searching, resultsCount, loadState]);

  // Keep ?q= in the address so back/refresh and shared links keep the search.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url);
  }, [query]);

  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchInput.current?.blur();
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppShell current="explore" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.brand} data-compact={filtering || searching}>
          <h1 className={styles.hero}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.wordmark}
              src="/brand/discovr-wordmark-bone.svg"
              alt="discovr"
              width={106}
              height={25}
            />
            <span className={styles.tagline}>
              Goa, from people who know where to go
            </span>
          </h1>

        <form className={styles.searchForm} role="search" action="/" method="get" onSubmit={onSearchSubmit}>
        <label className={styles.search}>
          <SearchIcon />
          <span className="vh">Search Goa</span>
          <input
            ref={searchInput}
            name="q"
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Goa"
            enterKeyHint="search"
            autoComplete="off"
          />
        </label>
        </form>
        <div ref={stickSentinel} className={styles.sentinel} aria-hidden="true" />
        </header>

        <div
          className={styles.sticky}
          data-shown={stuck}
          inert={!stuck}
        >
          <div className={styles.stickyInner}>
            <div className={styles.stickyBrand}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/discovr-wordmark-bone.svg"
                alt=""
                width={106}
                height={25}
                className={styles.miniWordmark}
              />
            </div>
            {/* Filter chips: hidden for now, bring back later.
            {!searching ? (
              <div className={styles.filters} role="group" aria-label="Filters">
                {FEED_FILTERS.map((f) => (
                  <Chip
                    key={f}
                    selected={isQuickOn(filters, f)}
                    onClick={() => setFilters(toggleQuick(filters, f))}
                  >
                    {f}
                  </Chip>
                ))}
                <Chip
                  aria-haspopup="dialog"
                  className={chipStyles.icon}
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersIcon />
                  <span>Filters</span>
                </Chip>
              </div>
            ) : null}
            */}
          </div>
        </div>

        {loadState === "loading" ? <FeedSkeleton /> : null}

        {loadState === "error" ? (
          <EmptyState
            icon={<AlertIcon />}
            title="Can't load experiences"
            text={
              hasApiBaseUrl()
                ? "The catalog API didn't answer. Try again in a moment."
                : "Set NEXT_PUBLIC_API_BASE_URL to your API."
            }
            role="alert"
          />
        ) : null}

        {loadState === "ready" && searching ? (
          <p ref={resultsRef} className={styles.resultCount} role="status">
            {searchResults.length === 0
              ? `Nothing for “${query.trim()}”`
              : `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} for “${query.trim()}”`}
          </p>
        ) : null}

        {loadState === "ready" && searching ? (
          searchResults.length === 0 ? (
            <p className={styles.searchEmpty}>
              Nothing matched. Try a place name, or clear search for tonight&apos;s
              shortlist.
            </p>
          ) : (
            <TrackList list="search" layout="stack" searchQuery={needle}>
              <div className={styles.stack}>
                {searchResults.map((item, i) => (
                  <ExperienceCard
                    key={item.slug}
                    density="landscape"
                    href={`/experiences/${item.slug}`}
                    title={item.title}
                    placeLabel={areaOf(item)}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    blurb={item.blurb}
                    durationLabel={item.durationLabel}
                    priceLabel={priceLabel(item)}
                    saved={saved.isSaved(item.slug)}
                    onToggleSave={() => onToggleSave(item.slug)}
                    track={cardTrack(item, i)}
                  />
                ))}
              </div>
            </TrackList>
          )
        ) : null}

        {loadState === "ready" && !searching && filtering ? (
          <section className={styles.results} aria-label="Filtered results">
            <div className={styles.active}>
              {activeLabels(filters).map((label) => (
                <button
                  key={label}
                  type="button"
                  className={styles.pill}
                  aria-label={`Remove ${label}`}
                  onClick={() => setFilters(withoutLabel(filters, label))}
                >
                  <span>{label}</span>
                  <CrossIcon />
                </button>
              ))}
              <button type="button" className={styles.clear} onClick={() => setFilters(NO_FILTERS)}>
                Clear all
              </button>
            </div>
            {filtered.length === 0 ? (
              <p className={styles.searchEmpty}>Nothing fits all of that. Drop a filter or two.</p>
            ) : (
              <ul className={styles.grid}>
                {filtered.map((item) => (
                  <li key={item.slug}>
                    <ExperienceCard
                      density="portrait"
                      href={`/experiences/${item.slug}`}
                      title={item.title}
                      placeLabel={areaOf(item)}
                      imageSrc={item.imageSrc}
                      imageAlt={item.imageAlt}
                      saved={saved.isSaved(item.slug)}
                      onToggleSave={() => onToggleSave(item.slug)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {loadState === "ready" && !searching && !filtering
          ? sections.map((section, i) => (
              <HomeSection
                key={section.id}
                section={section}
                position={i + 1}
                isSaved={saved.isSaved}
                onToggleSave={onToggleSave}
              />
            ))
          : null}

        <FilterSheet
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          areas={areas}
          value={filters}
          onApply={setFilters}
          countFor={(draft) => applyFilters(allCards, draft).length}
        />
      </div>
    </AppShell>
  );
}

/* Filter chips helpers: bring back with the chips.
const QUICK_TYPES: FeedFilter[] = ["Food and drink", "Nightlife", "Wellness"];

function isQuickOn(f: FeedFilters, chip: FeedFilter): boolean {
  if (chip === "Tonight" || chip === "This weekend") return f.when === chip;
  if (chip === "Near me") return f.nearMe;
  if (chip === "Under ₹1,000") return f.price === chip;
  return f.types.includes(chip);
}

function toggleQuick(f: FeedFilters, chip: FeedFilter): FeedFilters {
  const on = isQuickOn(f, chip);
  if (chip === "Tonight" || chip === "This weekend") return { ...f, when: on ? null : chip };
  if (chip === "Near me") return { ...f, nearMe: !on };
  if (chip === "Under ₹1,000") return { ...f, price: on ? null : chip };
  if (QUICK_TYPES.includes(chip)) {
    return { ...f, types: on ? f.types.filter((t) => t !== chip) : [...f.types, chip] };
  }
  return f;
}
*/

