"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FEED_FILTERS,
  priceLabel,
  type FeedFilter,
  type FeedSection,
} from "@/features/home/utils/feedData";
import styles from "@/features/home/styles/exploreFeed.module.css";
import { AppShell } from "@/shared/components/AppShell";
import { Chip } from "@/shared/components/Chip";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExperienceCard } from "@/shared/components/ExperienceCard";
import {
  AlertIcon,
  MessageIcon,
  PhoneIcon,
  SearchIcon,
} from "@/shared/components/icons";
import { useToast } from "@/shared/components/Toast";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";
import { fetchCatalogFeed } from "@/shared/utils/catalogApi";
import { DISCOVR_PHONE } from "@/shared/utils/discovrContact";
import { useSaved } from "@/shared/utils/useSaved";

type LoadState = "loading" | "ready" | "error";

export function ExploreFeed() {
  const [filter, setFilter] = useState<FeedFilter>("Tonight");
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const saved = useSaved();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    if (!hasApiBaseUrl()) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    fetchCatalogFeed()
      .then((remote) => {
        if (cancelled) return;
        if (!remote?.length) {
          setSections([]);
          setLoadState("error");
          return;
        }
        setSections(remote);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell current="explore" savedDot={saved.hasAny}>
      <div className={styles.page}>
        <header className={styles.brand}>
          <p className={styles.wordmark}>discovr</p>
          <p className={styles.tagline}>Goa, from people who know where to go</p>
        </header>

        <Link href="/search" className={styles.search}>
          <SearchIcon />
          <span>Search Goa</span>
        </Link>

        <div className={styles.filters} role="group" aria-label="Filters">
          {FEED_FILTERS.map((f) => (
            <Chip
              key={f}
              selected={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </Chip>
          ))}
        </div>

        {loadState === "loading" ? (
          <p className="t-body-sm" style={{ color: "var(--ink-muted)" }}>
            Loading tonight&apos;s picks…
          </p>
        ) : null}

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

        {loadState === "ready"
          ? sections.map((section) => (
              <section
                key={section.id}
                className={styles.section}
                aria-labelledby={`sec-${section.id}`}
              >
                <h2 id={`sec-${section.id}`} className={styles.sectionTitle}>
                  {section.title}
                </h2>
                {section.density === "portrait" ? (
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
                          priceLabel={priceLabel(item)}
                          saved={saved.isSaved(item.slug)}
                          onToggleSave={() => {
                            const was = saved.isSaved(item.slug);
                            saved.toggle(item.slug);
                            toast(
                              was
                                ? "Removed from saved"
                                : "Saved. Send it to your group from Saved.",
                            );
                          }}
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
                        onToggleSave={() => {
                          const was = saved.isSaved(item.slug);
                          saved.toggle(item.slug);
                          toast(
                            was
                              ? "Removed from saved"
                              : "Saved. Send it to your group from Saved.",
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          : null}

        <footer className={styles.promo}>
          <h2 className={styles.promoTitle}>
            discovr the best of what Goa has to offer
          </h2>
          <div className={styles.promoActions}>
            <a
              className={styles.circle}
              href={`https://wa.me/${DISCOVR_PHONE.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp discovr"
            >
              <MessageIcon />
            </a>
            <a
              className={styles.circle}
              href={`tel:${DISCOVR_PHONE}`}
              aria-label="Call discovr"
            >
              <PhoneIcon />
            </a>
          </div>
          <nav className={styles.promoLinks} aria-label="More from discovr">
            <Link href="/saved">Saved</Link>
            <Link href="/about">About us</Link>
            <Link href="/how-we-pick">How we pick</Link>
            <Link href="/list-with-us">List with us</Link>
            <Link href="/help">Help</Link>
          </nav>
        </footer>
      </div>
    </AppShell>
  );
}
