import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { formatPrice } from "@/shared/utils/formatPrice";
import { JsonLd } from "@/shared/seo/components/JsonLd";
import { experienceSchema } from "@/shared/seo/utils/experienceSchema";
import { ExperienceClient } from "@/features/experience/components/ExperienceClient";
import {
  fetchCatalogCards,
  fetchCatalogExperience,
} from "@/shared/utils/catalogApi";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Cached so each listing is part of the page HTML that crawlers fetch.
async function getExperience(slug: string) {
  "use cache";
  cacheLife("minutes");
  return fetchCatalogExperience(slug);
}

async function getRelated() {
  "use cache";
  cacheLife("minutes");
  return (await fetchCatalogCards()) ?? [];
}

// Known listings are built ahead; new ones render on first visit.
export async function generateStaticParams() {
  const cards = (await fetchCatalogCards()) ?? [];
  return cards.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const e = await getExperience(slug);
  if (!e) return { title: "Not found" };
  // Decision first: price and best time, then the verdict.
  const lead = [
    !e.price.askForPrice && e.price.fromAmount > 0 ? `From ${formatPrice(e.price.fromAmount)}.` : "",
    e.hours?.bestTime ? `Best time: ${e.hours.bestTime}` : "",
  ].filter(Boolean);
  const description = [...lead, e.verdict || e.about.slice(0, 160)].join(" ");
  const photo = e.photos[0];
  return {
    title: e.title,
    description,
    alternates: { canonical: `/experiences/${slug}` },
    openGraph: { title: e.title, description, type: "article", images: photo ? [{ url: photo.src, alt: photo.alt }] : undefined },
    twitter: { card: "summary_large_image", title: e.title, description },
  };
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) notFound();

  const relatedItems = await getRelated();

  return (
    <>
      <JsonLd data={experienceSchema(experience)} />
      <ExperienceClient experience={experience} relatedItems={relatedItems} />
    </>
  );
}
