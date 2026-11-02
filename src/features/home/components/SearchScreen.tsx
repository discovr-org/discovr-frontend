"use client";

import { useEffect, useMemo, useState } from "react";
import { priceLabel, type FeedItem } from "@/features/home/utils/feedData";
import { AppShell } from "@/shared/components/AppShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { AlertIcon, SearchIcon } from "@/shared/components/icons";
import { fetchCatalogFeed, flattenFeedItems } from "@/shared/utils/catalogApi";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/home/styles/searchScreen.module.css";

export function SearchScreen() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const saved = useSaved();

  useEffect(() => {
    let cancelled = false;
    fetchCatalogFeed()
      .then((feed) => {
        if (cancelled) return;
        if (!feed?.length) {
          setLoadError(true);
          setItems([]);
          return;
        }
        setItems(flattenFeedItems(feed));
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return items.filter((item) => {
      const hay =
        `${item.title} ${item.placeLabel} ${item.blurb ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, items]);

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

        <div className={styles.stack}>
          {results.map((item) => (
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
              onToggleSave={() => saved.toggle(item.slug)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
