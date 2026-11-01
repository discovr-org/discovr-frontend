"use client";

import { useMemo, useState } from "react";
import { feedSections, priceLabel } from "@/features/home/utils/feedData";
import { AppShell } from "@/shared/components/AppShell";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { SearchIcon } from "@/shared/components/icons";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/home/styles/searchScreen.module.css";

const allItems = feedSections.flatMap((s) => s.items);

export function SearchScreen() {
  const [q, setQ] = useState("");
  const saved = useSaved();

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (seen.has(item.slug)) return false;
      const hay = `${item.title} ${item.placeLabel} ${item.blurb ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
      seen.add(item.slug);
      return true;
    });
  }, [q]);

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

        {q.trim() && results.length === 0 && (
          <p className={styles.empty}>
            Nothing matched. Try a place name, or go back to tonight&apos;s shortlist.
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
