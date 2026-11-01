import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExperienceClient } from "@/features/experience/components/ExperienceClient";
import { ExperienceDemo } from "@/features/experience/components/ExperienceDemo";
import {
  sampleListings,
  type SampleListing,
} from "@/features/experience/utils/sampleExperience";
import type { Experience, ScreenState } from "@/types/experience";
import detailStyles from "@/features/experience/components/ExperienceDetail.module.css";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import { fetchCatalogExperience } from "@/shared/utils/catalogApi";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string; demo?: string }>;
};

const STATES: ScreenState[] = ["populated", "loading", "offline", "error"];

export function generateStaticParams() {
  return (Object.keys(sampleListings) as SampleListing[]).flatMap((key) => [
    { slug: key },
    { slug: sampleListings[key].slug },
  ]);
}

function resolveLocal(slug: string): Experience | null {
  const key = (Object.keys(sampleListings) as SampleListing[]).find(
    (k) => sampleListings[k].slug === slug || k === slug,
  );
  return key ? sampleListings[key] : null;
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

  const remote = await fetchCatalogExperience(
    listingKey ? sampleListings[listingKey].slug : slug,
  );
  const experience = remote ?? resolveLocal(slug);
  if (!experience) notFound();

  return <ExperienceClient experience={experience} state={state} />;
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
