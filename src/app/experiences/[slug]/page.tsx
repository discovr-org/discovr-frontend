import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExperienceClient } from "@/features/experience/components/ExperienceClient";
import type { ScreenState } from "@/types/experience";
import detailStyles from "@/features/experience/components/ExperienceDetail.module.css";
import { ExperienceDetailSkeleton } from "@/shared/components/Skeleton";
import {
  fetchCatalogCards,
  fetchCatalogExperience,
} from "@/shared/utils/catalogApi";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string }>;
};

const STATES: ScreenState[] = ["populated", "loading", "offline", "error"];

async function ExperiencePageBody({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const state = STATES.includes(query.state as ScreenState)
    ? (query.state as ScreenState)
    : "populated";

  const experience = await fetchCatalogExperience(slug);
  if (!experience) notFound();

  const relatedItems = (await fetchCatalogCards()) ?? [];

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
