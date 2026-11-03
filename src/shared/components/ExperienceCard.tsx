"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTrackList } from "@/shared/analytics/components/TrackList";
import { rememberCardSource, type CardTrack } from "@/shared/analytics/utils/cardSource";
import type { CardProps } from "@/shared/analytics/utils/events";
import { track as trackEvent } from "@/shared/analytics/utils/track";
import { useTrackView } from "@/shared/analytics/utils/useTrackView";
import { FALLBACK_IMAGE } from "@/shared/utils/catalogApi";
import { HeartIcon } from "./icons";
import styles from "./ExperienceCard.module.css";

export type ExperienceCardDensity = "portrait" | "landscape" | "tile";

export type ExperienceCardProps = {
  href: string;
  title: string;
  placeLabel: string;
  imageSrc: string;
  imageAlt: string;
  /** Short blurb under the title on landscape cards. */
  blurb?: string;
  /** e.g. "1 hour 30 min" */
  durationLabel?: string;
  /** e.g. "From ₹1,400". Portrait cards show it only when passed. */
  priceLabel?: string;
  density?: ExperienceCardDensity;
  saved?: boolean;
  onToggleSave?: () => void;
  priority?: boolean;
  /** Card analytics. List and section come from the surrounding TrackList. */
  track?: CardTrack;
};

/**
 * Listing card for the feed. Portrait for horizontal carousels;
 * landscape for the single-column shortlist; tile (photo, then name and price) for grids.
 */
export function ExperienceCard({
  href,
  title,
  placeLabel,
  imageSrc,
  imageAlt,
  blurb,
  durationLabel,
  priceLabel,
  density = "portrait",
  saved = false,
  onToggleSave,
  priority = false,
  track,
}: ExperienceCardProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const list = useTrackList();
  const cardEvent: CardProps | null =
    track && list ? { ...list, ...track, title } : null;
  const viewRef = useTrackView<HTMLElement>(() => {
    if (cardEvent) trackEvent("experience_card_viewed", cardEvent);
  }, cardEvent ? `${cardEvent.list}:${cardEvent.section_id ?? ""}:${cardEvent.slug}` : "");
  const onCardClick = () => {
    if (!cardEvent) return;
    trackEvent("experience_card_clicked", cardEvent);
    rememberCardSource(cardEvent);
  };
  const src = failedSrc === imageSrc ? FALLBACK_IMAGE : imageSrc;
  const meta = [placeLabel, durationLabel].filter(Boolean).join(" · ");
  const portrait = density === "portrait";
  const tile = density === "tile";

  const heart = onToggleSave ? (
    <button
      type="button"
      className={styles.save}
      aria-label={`Save ${title}`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSave();
      }}
    >
      <HeartIcon />
    </button>
  ) : null;

  return (
    // Taps on the save heart stop propagation, so only opening the listing counts as a click.
    <article ref={viewRef} className={[styles.card, styles[density]].join(" ")} onClick={onCardClick}>
      <Link href={href} className={styles.mediaLink}>
        <div className={styles.media}>
          {src ? (
            <Image
              src={src}
              onError={() => setFailedSrc(imageSrc)}
              alt={imageAlt}
              fill
              sizes={
                tile
                  ? "(min-width: 1024px) 288px, (min-width: 900px) 224px, (min-width: 600px) 344px, 50vw"
                  : portrait
                    ? "(min-width: 1024px) 340px, (min-width: 600px) 280px, 70vw"
                    : "(min-width: 1024px) 560px, (min-width: 600px) 688px, 100vw"
              }
              priority={priority}
              className={styles.img}
              unoptimized={src.startsWith("http")}
            />
          ) : (
            <div className={styles.img} aria-hidden />
          )}
          {heart}
          {portrait && (
            <div className={styles.overlay}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.place}>{placeLabel}</p>
              {priceLabel ? (
                <p className={styles.overlayPrice}>{priceLabel}</p>
              ) : null}
            </div>
          )}
        </div>
      </Link>

      {tile && (
        <>
          <h3 className={styles.title}>
            <Link href={href} className={styles.bodyLink}>
              {title}
            </Link>
          </h3>
          {priceLabel ? <p className={styles.tilePrice}>{priceLabel}</p> : null}
        </>
      )}

      {density === "landscape" && (
        <div className={styles.body}>
          <Link href={href} className={styles.bodyLink}>
            <h3 className={styles.title}>{title}</h3>
            {blurb && <p className={styles.blurb}>{blurb}</p>}
            {meta && <p className={styles.meta}>{meta}</p>}
          </Link>
          {priceLabel ? (
            <div className={styles.footer}>
              <span className={styles.price}>{priceLabel}</span>
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
