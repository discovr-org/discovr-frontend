"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "./icons";
import styles from "./ExperienceCard.module.css";

export type ExperienceCardDensity = "portrait" | "landscape";

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
  /** e.g. "From ₹1,400" or "From ₹2,000 + taxes" */
  priceLabel?: string;
  density?: ExperienceCardDensity;
  saved?: boolean;
  onToggleSave?: () => void;
  priority?: boolean;
};

/**
 * Listing card for the feed. Portrait for horizontal carousels;
 * landscape for the single-column shortlist.
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
}: ExperienceCardProps) {
  const meta = [placeLabel, durationLabel].filter(Boolean).join(" · ");

  return (
    <article className={[styles.card, styles[density]].join(" ")}>
      <Link href={href} className={styles.mediaLink}>
        <div className={`${styles.media} photo-lift`}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes={
                density === "portrait"
                  ? "268px"
                  : "(max-width: 480px) 100vw, 480px"
              }
              priority={priority}
              className={styles.img}
              unoptimized={imageSrc.startsWith("http")}
            />
          ) : (
            <div className={styles.img} aria-hidden />
          )}
          {onToggleSave && (
            <button
              type="button"
              className={styles.save}
              aria-label={saved ? "Remove from saved" : "Save this experience"}
              aria-pressed={saved}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave();
              }}
            >
              <HeartIcon />
            </button>
          )}
          {density === "portrait" && (
            <div className={styles.overlay}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.place}>{placeLabel}</p>
            </div>
          )}
        </div>
      </Link>

      {density === "landscape" && (
        <div className={styles.body}>
          <Link href={href} className={styles.bodyLink}>
            <h3 className={styles.title}>{title}</h3>
            {blurb && <p className={styles.blurb}>{blurb}</p>}
            {meta && <p className={styles.meta}>{meta}</p>}
          </Link>
          <div className={styles.footer}>
            {priceLabel && <span className={styles.price}>{priceLabel}</span>}
            {onToggleSave && (
              <button
                type="button"
                className={styles.saveInline}
                aria-label={saved ? "Remove from saved" : "Save this experience"}
                aria-pressed={saved}
                onClick={onToggleSave}
              >
                <HeartIcon />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
