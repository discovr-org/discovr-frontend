"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FEED_FILTERS,
  priceLabel,
  type FeedFilter,
} from "@/features/home/utils/feedData";
import { buildHomeSections } from "@/features/home/utils/homeSections";
import styles from "@/features/home/styles/exploreFeed.module.css";
import { AppShell } from "@/shared/components/AppShell";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { Chip } from "@/shared/components/Chip";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import {
  AlertIcon,
  SearchIcon,
} from "@/shared/components/icons";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useToast } from "@/shared/components/Toast";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { useCatalogCards } from "@/shared/utils/useCatalogCards";
import { FeedSkeleton } from "@/features/home/components/FeedSkeleton";
import { useSaved } from "@/shared/utils/useSaved";

export function ExploreFeed() {
  const [filter, setFilter] = useState<FeedFilter | null>(null);
  const [query, setQuery] = useState("");
  const [stuck, setStuck] = useState(false);
  const stickSentinel = useRef<HTMLDivElement>(null);
  const cards = useCatalogCards();
  const sections = useMemo(() => buildHomeSections(cards.data ?? []), [cards.data]);
  // Cached data wins: only show loading/error when there is nothing to paint.
  const loadState = cards.data ? "ready" : cards.isError || !hasApiBaseUrl() ? "error" : "loading";
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
    const io = new IntersectionObserver(([entry]) =>
      setStuck(!entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const needle = query.trim().toLowerCase();
  const searching = needle.length > 0;

  const searchResults = useMemo(() => {
    if (!searching) return [];
    return (cards.data ?? []).filter((item) => {
      const hay =
        `${item.title} ${item.placeLabel} ${item.blurb ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [needle, searching, cards.data]);

  return (
    <AppShell current="explore" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.brand}>
          <h1 className={styles.hero}>
            <span className={styles.wordmark}>discovr</span>
            <span className={styles.tagline}>
              Goa, from people who know where to go
            </span>
          </h1>
        </header>

        <label className={styles.search}>
          <SearchIcon />
          <span className="vh">Search Goa</span>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Goa"
            enterKeyHint="search"
            autoComplete="off"
          />
        </label>

        <div ref={stickSentinel} aria-hidden="true" />
        <div
          className={styles.sticky}
          data-shown={stuck}
          inert={!stuck}
        >
          <p className={styles.miniWordmark} aria-hidden="true">
            discovr
          </p>
          {!searching ? (
            <div className={styles.filters} role="group" aria-label="Filters">
              {FEED_FILTERS.map((f) => (
                <Chip
                  key={f}
                  selected={filter === f}
                  onClick={() => setFilter(filter === f ? null : f)}
                >
                  {f}
                </Chip>
              ))}
            </div>
          ) : null}
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
          searchResults.length === 0 ? (
            <p className={styles.searchEmpty}>
              Nothing matched. Try a place name, or clear search for tonight&apos;s
              shortlist.
            </p>
          ) : (
            <div className={styles.stack}>
              {searchResults.map((item) => (
                <ExperienceCard
                  key={item.slug}
                  density="landscape"
                  href={`/experiences/${item.slug}`}
                  title={item.title}
                  placeLabel={item.placeLabel}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  blurb={item.blurb}
                  durationLabel={item.durationLabel}
                  priceLabel={priceLabel(item)}
                  saved={saved.isSaved(item.slug)}
                  onToggleSave={() => onToggleSave(item.slug)}
                />
              ))}
            </div>
          )
        ) : null}

        {loadState === "ready" && !searching
          ? sections.map((section) => (
              <section
                key={section.id}
                className={styles.section}
                aria-labelledby={`sec-${section.id}`}
              >
                <h2 id={`sec-${section.id}`} className={styles.sectionTitle}>
                  {section.title}
                </h2>
                {section.layout === "rail" ? (
                  <div
                    className={styles.rail}
                    role="list"
                    aria-label={`${section.title}, swipe for more`}
                  >
                    {section.items.map((item) => (
                      <div
                        key={`${section.id}-${item.slug}-${item.title}`}
                        role="listitem"
                      >
                        <ExperienceCard
                          density="portrait"
                          href={`/experiences/${item.slug}`}
                          title={item.title}
                          placeLabel={item.placeLabel}
                          imageSrc={item.imageSrc}
                          imageAlt={item.imageAlt}
                          saved={saved.isSaved(item.slug)}
                          onToggleSave={() => onToggleSave(item.slug)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.stack}>
                    {section.items.map((item) => (
                      <ExperienceCard
                        key={`${section.id}-${item.slug}-${item.title}`}
                        density="landscape"
                        href={`/experiences/${item.slug}`}
                        title={item.title}
                        placeLabel={item.placeLabel}
                        imageSrc={item.imageSrc}
                        imageAlt={item.imageAlt}
                        blurb={item.blurb}
                        durationLabel={item.durationLabel}
                        priceLabel={priceLabel(item)}
                        saved={saved.isSaved(item.slug)}
                        onToggleSave={() => onToggleSave(item.slug)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          : null}

        <div className={styles.footerWrap}>
          <SiteFooter source="home" />
        </div>
      </div>
    </AppShell>
  );
}
