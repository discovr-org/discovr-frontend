"use client";

import Link from "next/link";
import { feedSections, priceLabel } from "@/features/home/utils/feedData";
import { AppShell } from "@/shared/components/AppShell";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import { HeartIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/Toast";
import { useSaved } from "@/shared/utils/useSaved";
import styles from "@/features/saved/styles/savedScreen.module.css";

const allItems = feedSections.flatMap((s) => s.items);

export function SavedScreen() {
  const saved = useSaved();
  const toast = useToast();
  const items = allItems.filter(
    (item, i, arr) =>
      saved.isSaved(item.slug) &&
      arr.findIndex((x) => x.slug === item.slug) === i,
  );

  return (
    <AppShell current="saved" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Saved</h1>
          <p className={styles.lead}>
            Things you marked for later. We&apos;ll tell you when the price drops.
          </p>
        </header>

        {items.length === 0 ? (
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
