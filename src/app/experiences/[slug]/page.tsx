import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExperienceClient } from "@/features/experience/components/ExperienceClient";
import { ExperienceDemo } from "@/features/experience/components/ExperienceDemo";
import {
  sampleListings,
  type SampleListing,
} from "@/features/experience/utils/sampleExperience";
import type { ScreenState } from "@/types/experience";
import detailStyles from "@/features/experience/components/ExperienceDetail.module.css";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import {
  fetchCatalogExperience,
  fetchCatalogFeed,
  flattenFeedItems,
} from "@/shared/utils/catalogApi";
import { hasApiBaseUrl } from "@/shared/utils/apiBase";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string; demo?: string }>;
};

const STATES: ScreenState[] = ["populated", "loading", "offline", "error"];

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return (Object.keys(sampleListings) as SampleListing[]).flatMap((key) => [
    { slug: key },
    { slug: sampleListings[key].slug },
  ]);
}

async function ExperiencePageBody({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const state = STATES.includes(query.state as ScreenState)
    ? (query.state as ScreenState)
    : "populated";

  const listingKey = (Object.keys(sampleListings) as SampleListing[]).find(
    (key) => sampleListings[key].slug === slug || key === slug,
  );

  if (query.demo === "1") {
    if (!listingKey) notFound();
    return <ExperienceDemo initialState={state} initialListing={listingKey} />;
  }

  const experience = await fetchCatalogExperience(
    listingKey ? sampleListings[listingKey].slug : slug,
  );

  if (!experience) {
    if (hasApiBaseUrl()) notFound();
    // No API configured — demo samples only
    const local = listingKey ? sampleListings[listingKey] : null;
    if (!local) notFound();
    return <ExperienceClient experience={local} state={state} />;
  }

  const feed = await fetchCatalogFeed();
  const relatedItems = feed ? flattenFeedItems(feed) : [];

  return (
    <ExperienceClient
      experience={experience}
      state={state}
      relatedItems={relatedItems}
    />
  );
}

export default function ExperiencePage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <ExperienceDetailSkeleton summaryClassName={detailStyles.summary} />
      }
    >
      <ExperiencePageBody {...props} />
    </Suspense>
  );
}
