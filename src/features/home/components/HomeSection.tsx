"use client";

import { priceLabel, type FeedSection } from "@/features/home/utils/feedData";
import { areaOf } from "@/features/home/utils/feedFilters";
import styles from "@/features/home/styles/exploreFeed.module.css";
import { TrackList } from "@/shared/analytics/components/TrackList";
import { cardTrack } from "@/shared/analytics/utils/cardSource";
import { track } from "@/shared/analytics/utils/track";
import { useTrackView } from "@/shared/analytics/utils/useTrackView";
import { ExperienceCard } from "@/shared/components/ExperienceCard";

type HomeSectionProps = {
  section: FeedSection;
  /** 1-based order on the page. */
  position: number;
  isSaved: (slug: string) => boolean;
  onToggleSave: (slug: string) => void;
};

/** One titled home section: a sideways rail, or full-width cards stacked. */
export function HomeSection({ section, position, isSaved, onToggleSave }: HomeSectionProps) {
  const ref = useTrackView<HTMLElement>(
    () =>
      track("home_section_viewed", {
        section_id: section.id,
        section_title: section.title,
        cards_count: section.items.length,
        position,
        layout: section.layout,
      }),
    section.id,
  );

  return (
    <section ref={ref} className={styles.section} aria-labelledby={`sec-${section.id}`}>
      <h2 id={`sec-${section.id}`} className={styles.sectionTitle}>
        {section.title}
      </h2>
      <TrackList
        list="home"
        sectionId={section.id}
        sectionTitle={section.title}
        layout={section.layout}
      >
        {section.layout === "rail" ? (
          <div className={styles.rail} role="list" aria-label={`${section.title}, swipe for more`}>
            {section.items.map((item, i) => (
              <div key={`${section.id}-${item.slug}-${item.title}`} role="listitem">
                <ExperienceCard
                  density="portrait"
                  href={`/experiences/${item.slug}`}
                  title={item.title}
                  placeLabel={areaOf(item)}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  saved={isSaved(item.slug)}
                  onToggleSave={() => onToggleSave(item.slug)}
                  track={cardTrack(item, i)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.stack}>
            {section.items.map((item, i) => (
              <ExperienceCard
                key={`${section.id}-${item.slug}-${item.title}`}
                density="landscape"
                href={`/experiences/${item.slug}`}
                title={item.title}
                placeLabel={areaOf(item)}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                blurb={item.blurb}
                durationLabel={item.durationLabel}
                priceLabel={priceLabel(item)}
                saved={isSaved(item.slug)}
                onToggleSave={() => onToggleSave(item.slug)}
                track={cardTrack(item, i)}
              />
            ))}
          </div>
        )}
      </TrackList>
    </section>
  );
}
