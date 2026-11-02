"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { priceLabel, type FeedItem } from "@/features/home/utils/feedData";
import { AppShell } from "@/shared/components/AppShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { HeartIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/Toast";
import {
  fetchCatalogExperience,
  fetchCatalogFeed,
  flattenFeedItems,
} from "@/shared/utils/catalogApi";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/saved/styles/savedScreen.module.css";

export function SavedScreen() {
  const saved = useSaved();
  const toast = useToast();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (saved.slugs.length === 0) {
        if (!cancelled) {
          setItems([]);
          setReady(true);
        }
        return;
      }

      const feed = await fetchCatalogFeed();
      const fromFeed = feed ? flattenFeedItems(feed) : [];
      const bySlug = new Map(fromFeed.map((item) => [item.slug, item]));

      const missing = saved.slugs.filter((slug) => !bySlug.has(slug));
      await Promise.all(
        missing.map(async (slug) => {
          const exp = await fetchCatalogExperience(slug);
          if (!exp) return;
          bySlug.set(slug, {
            slug: exp.slug,
            title: exp.title,
            placeLabel: exp.place.name,
            imageSrc: exp.photos[0]?.src ?? "",
            imageAlt: exp.photos[0]?.alt ?? exp.title,
            blurb: exp.verdict,
            durationLabel: exp.duration,
            priceInr: exp.price.askForPrice ? undefined : exp.price.fromAmount,
          });
        }),
      );

      if (cancelled) return;
      setItems(
        saved.slugs
          .map((slug) => bySlug.get(slug))
          .filter((item): item is FeedItem => Boolean(item)),
      );
      setReady(true);
    }

    setReady(false);
    void load();
    return () => {
      cancelled = true;
    };
  }, [saved.slugs]);

  return (
    <AppShell current="saved" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Saved</h1>
          <p className={styles.lead}>
            Things you marked for later. We&apos;ll tell you when the price
            drops.
          </p>
        </header>

        {!ready ? (
          <p className="t-body-sm" style={{ color: "var(--ink-muted)" }}>
            Loading your saves…
          </p>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<HeartIcon />}
            title="Nothing saved yet"
            text="Add a few and we'll tell you when the price drops."
            action={
              <Link href="/" className={styles.link}>
                Explore tonight
              </Link>
            }
          />
        ) : (
          <div className={styles.stack}>
            {items.map((item) => (
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
                saved
                onToggleSave={() => {
                  saved.toggle(item.slug);
                  toast("Removed from saved");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
