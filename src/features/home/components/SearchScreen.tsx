"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { priceLabel } from "@/features/home/utils/feedData";
import { areaOf } from "@/features/home/utils/feedFilters";
import { searchCards } from "@/features/home/utils/searchCards";
import { AppShell } from "@/shared/components/AppShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { AlertIcon, SearchIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/Toast";
import { useCatalogCards } from "@/shared/utils/useCatalogCards";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/home/styles/searchScreen.module.css";
import { TrackList } from "@/shared/analytics/components/TrackList";
import { cardTrack } from "@/shared/analytics/utils/cardSource";
import { track } from "@/shared/analytics/utils/track";

const SEARCH_SETTLE_MS = 600;

export function SearchScreen() {
  const [q, setQ] = useState("");
  const cards = useCatalogCards();
  const items = useMemo(() => cards.data ?? [], [cards.data]);
  const loadError = !cards.data && cards.isError;
  const saved = useSaved();
  const auth = useAuth();
  const toast = useToast();

  const results = useMemo(() => searchCards(items, q), [q, items]);
  const needle = q.trim();

  // One event per pause in typing, not per keystroke.
  const resultsCount = results.length;
  const ready = Boolean(cards.data);
  useEffect(() => {
    if (!needle || !ready) return;
    const timer = window.setTimeout(() => {
      track("search_performed", {
        query: needle,
        query_length: needle.length,
        results_count: resultsCount,
      });
    }, SEARCH_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [needle, resultsCount, ready]);

  return (
    <AppShell current="explore" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <label className={styles.field}>
          <SearchIcon />
          <span className="vh">Search Goa</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Goa"
            autoFocus
            enterKeyHint="search"
          />
        </label>

        {loadError ? (
          <EmptyState
            icon={<AlertIcon />}
            title="Can't search right now"
            text="The catalog API didn't answer."
            role="alert"
          />
        ) : null}

        {q.trim() && !loadError && results.length === 0 && (
          <p className={styles.empty}>
            Nothing matched. Try a place name, or go back to tonight&apos;s
            shortlist.
          </p>
        )}

        <TrackList list="search" layout="stack" searchQuery={needle}>
          <div className={styles.stack}>
            {results.map((item, i) => (
              <ExperienceCard
                track={cardTrack(item, i)}
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
                onToggleSave={() => {
                  const was = saved.isSaved(item.slug);
                  saved.toggle(item.slug);
                  if (!was && !auth.user) {
                    auth.openAuth("save");
                    return;
                  }
                  toast(
                    was
                      ? "Removed from saved"
                      : "Saved. Send it to your group from Saved.",
                  );
                }}
              />
            ))}
          </div>
        </TrackList>
      </div>
    </AppShell>
  );
}
