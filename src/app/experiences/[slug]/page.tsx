import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { experienceSchema } from "@/shared/seo/utils/experienceSchema";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const e = await fetchCatalogExperience(slug);
  if (!e) return { title: "Not found" };
  const description = e.verdict || e.about.slice(0, 160);
  const photo = e.photos[0];
  return {
    title: e.title,
    description,
    alternates: { canonical: `/experiences/${slug}` },
    openGraph: { title: e.title, description, type: "article", images: photo ? [{ url: photo.src, alt: photo.alt }] : undefined },
    twitter: { card: "summary_large_image", title: e.title, description },
  };
}

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
    <>
      <JsonLd data={experienceSchema(experience)} />
      <ExperienceClient
        experience={experience}
        state={state}
        relatedItems={relatedItems}
      />
    </>
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
